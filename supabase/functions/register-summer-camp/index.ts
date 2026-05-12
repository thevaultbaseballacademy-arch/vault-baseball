import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const normalizeEmail = (v: unknown) =>
  typeof v === "string" ? v.trim().toLowerCase() : "";

const safeQty = (q: unknown) => {
  const n = Math.floor(Number(q));
  return Number.isFinite(n) ? Math.max(1, Math.min(10, n)) : 1;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const t0 = Date.now();
  const log = (...args: unknown[]) =>
    console.log(`[register-summer-camp +${Date.now() - t0}ms]`, ...args);

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || stripeKey.startsWith("pk_")) {
      return json({ error: "Payment system not configured", code: "STRIPE_NOT_CONFIGURED" }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const {
      priceId,
      quantity,
      successUrl,
      cancelUrl,
      paymentMethod,
      idempotency_key,
      ...registration
    } = (body ?? {}) as Record<string, any>;

    const method: "card" | "bank_transfer" =
      paymentMethod === "bank_transfer" ? "bank_transfer" : "card";

    const parentEmail = normalizeEmail(registration.parent_email);
    if (!parentEmail) {
      return json({ error: "Parent email is required", code: "INVALID_REQUEST" }, 400);
    }
    if (method === "card" && (!priceId || typeof priceId !== "string")) {
      return json({ error: "Invalid price ID", code: "INVALID_PRICE_ID" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const origin = req.headers.get("origin") || "https://vault-baseball.lovable.app";
    const resolvedSuccess =
      successUrl || `${origin}/summer-camp?paid=1&session_id={CHECKOUT_SESSION_ID}`;
    const resolvedCancel = cancelUrl || `${origin}/summer-camp?canceled=1`;
    const amountCents = Number(registration.amount_cents ?? 0);
    const customerName =
      `${registration.athlete_first_name ?? ""} ${registration.athlete_last_name ?? ""}`.trim() ||
      null;

    // ─── BANK TRANSFER PATH ───────────────────────────────────────────
    if (method === "bank_transfer") {
      const { data: order, error: orderError } = await supabase
        .from("payment_orders")
        .insert({
          product_type: "summer_camp",
          amount_cents: amountCents,
          currency: "usd",
          payment_method: "bank_transfer",
          status: "pending_bank_transfer",
          customer_email: parentEmail,
          customer_name: customerName,
          idempotency_key: idempotency_key ?? null,
          metadata: {
            camp_location: registration.camp_location ?? null,
            registration_type: registration.registration_type ?? null,
            pricing_tier: registration.pricing_tier ?? null,
            selected_sessions: registration.selected_sessions ?? null,
            parent_phone: registration.parent_phone ?? null,
          },
        })
        .select("id, reference_code")
        .single();

      if (orderError || !order) {
        log("bank order insert failed", orderError);
        return json({ error: "Could not create order", code: "ORDER_INSERT_FAILED" }, 500);
      }

      const { data: regRow, error: regError } = await supabase
        .from("summer_camp_registrations")
        .insert({
          ...registration,
          parent_email: parentEmail,
          status: "pending_bank_transfer",
          payment_method: "bank_transfer",
          payment_order_id: order.id,
        })
        .select("id")
        .single();

      if (regError || !regRow) {
        log("bank reg insert failed", regError);
        return json({ error: "Could not save registration", code: "REG_INSERT_FAILED" }, 500);
      }

      // Link product → order (best-effort; non-blocking)
      supabase.from("payment_orders").update({ product_id: regRow.id }).eq("id", order.id)
        .then(({ error }) => error && log("link product_id failed", error));

      // Fire-and-forget instructions email
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "bank-transfer-instructions",
          recipientEmail: parentEmail,
          idempotencyKey: `bank-transfer-${order.id}`,
          templateData: {
            reference: order.reference_code,
            amountCents,
            campName: registration.camp_location,
            athleteName: customerName,
          },
        },
      }).catch((err) => log("instructions email failed", err));

      return json({
        success: true,
        payment_method: "bank_transfer",
        registration_id: regRow.id,
        order_id: order.id,
        reference_code: order.reference_code,
        instructions_url: `${origin}/payment/bank-instructions/${order.id}`,
      });
    }

    // ─── CARD / STRIPE CHECKOUT PATH ───────────────────────────────────

    // Light idempotency: if client retries with same key within 1h, reuse the order.
    let order: { id: string; stripe_session_id: string | null } | null = null;
    if (idempotency_key) {
      const { data: existing } = await supabase
        .from("payment_orders")
        .select("id, stripe_session_id, status, checkout_url, expires_at")
        .eq("idempotency_key", idempotency_key)
        .maybeSingle();
      if (existing && existing.status === "pending" && existing.checkout_url) {
        log("idempotent reuse", existing.id);
        return json({
          success: true,
          reused: true,
          order_id: existing.id,
          registration_id: null,
          stripe_session_id: existing.stripe_session_id,
          checkout_url: existing.checkout_url,
        });
      }
      if (existing) order = { id: existing.id, stripe_session_id: existing.stripe_session_id };
    }

    // 1) Create the order + registration FIRST so the lead is never lost.
    if (!order) {
      const { data: orderRow, error: orderErr } = await supabase
        .from("payment_orders")
        .insert({
          product_type: "summer_camp",
          amount_cents: amountCents,
          currency: "usd",
          payment_method: "card",
          status: "pending",
          customer_email: parentEmail,
          customer_name: customerName,
          idempotency_key: idempotency_key ?? null,
          metadata: {
            camp_location: registration.camp_location ?? null,
            registration_type: registration.registration_type ?? null,
            pricing_tier: registration.pricing_tier ?? null,
            selected_sessions: registration.selected_sessions ?? null,
            parent_phone: registration.parent_phone ?? null,
            quantity: safeQty(quantity),
            price_id: priceId,
          },
        })
        .select("id, stripe_session_id")
        .single();

      if (orderErr || !orderRow) {
        log("card order insert failed", orderErr);
        return json({ error: "Could not create order", code: "ORDER_INSERT_FAILED" }, 500);
      }
      order = orderRow;
    }

    const { data: regRow, error: regErr } = await supabase
      .from("summer_camp_registrations")
      .insert({
        ...registration,
        parent_email: parentEmail,
        status: "pending_payment",
        payment_method: "card",
        payment_order_id: order.id,
      })
      .select("id")
      .single();

    if (regErr || !regRow) {
      log("card reg insert failed", regErr);
      // Mark order so admin still sees the lead context
      await supabase
        .from("payment_orders")
        .update({ status: "checkout_failed", error_message: "Registration insert failed" })
        .eq("id", order.id);
      return json({ error: "Could not save registration", code: "REG_INSERT_FAILED" }, 500);
    }

    // Link product → order
    supabase
      .from("payment_orders")
      .update({ product_id: regRow.id })
      .eq("id", order.id)
      .then(({ error }) => error && log("link product_id failed", error));

    // 2) Create Stripe session. If it fails, capture the lead as checkout_failed.
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_email: parentEmail,
        line_items: [{ price: priceId, quantity: safeQty(quantity) }],
        success_url: resolvedSuccess,
        cancel_url: resolvedCancel,
        allow_promotion_codes: true,
        metadata: {
          source: "summer-camp",
          registration_id: regRow.id,
          payment_order_id: order.id,
          parent_email: parentEmail,
        },
      });

      // Persist session info (non-blocking on failure of this update)
      await Promise.all([
        supabase
          .from("payment_orders")
          .update({
            stripe_session_id: session.id,
            checkout_url: session.url,
            expires_at: session.expires_at
              ? new Date(session.expires_at * 1000).toISOString()
              : null,
          })
          .eq("id", order.id),
        supabase
          .from("summer_camp_registrations")
          .update({ stripe_session_id: session.id })
          .eq("id", regRow.id),
      ]);

      log("checkout ready");
      return json({
        success: true,
        registration_id: regRow.id,
        order_id: order.id,
        stripe_session_id: session.id,
        checkout_url: session.url,
      });
    } catch (stripeErr) {
      const message = stripeErr instanceof Error ? stripeErr.message : String(stripeErr);
      log("stripe session creation failed", message);

      await Promise.all([
        supabase
          .from("payment_orders")
          .update({ status: "checkout_failed", error_message: message })
          .eq("id", order.id),
        supabase
          .from("summer_camp_registrations")
          .update({ status: "pending_followup" })
          .eq("id", regRow.id),
      ]);

      // Notify admin best-effort
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "checkout-failed-internal",
          recipientEmail: "emejia2291@gmail.com",
          idempotencyKey: `checkout-failed-${order.id}`,
          templateData: {
            order_id: order.id,
            registration_id: regRow.id,
            parent_email: parentEmail,
            athlete: customerName,
            amount_cents: amountCents,
            error: message,
          },
        },
      }).catch(() => void 0);

      return json(
        {
          error: "We saved your registration but couldn't open secure checkout.",
          code: "CHECKOUT_FAILED_FOLLOWUP",
          order_id: order.id,
          registration_id: regRow.id,
        },
        502,
      );
    }
  } catch (error) {
    console.error("[register-summer-camp] unexpected", error);
    return json(
      { error: "Unexpected error opening checkout.", code: "CHECKOUT_ERROR" },
      500,
    );
  }
});
