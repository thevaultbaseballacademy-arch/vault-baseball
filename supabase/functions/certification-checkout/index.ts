import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import {
  attachStripeSession,
  corsHeaders,
  createPendingOrder,
  findReusableOrder,
  getServiceClient,
  json,
  markCheckoutFailed,
  notifyCheckoutFailed,
} from "../_shared/payment-orders.ts";

const log = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CERTIFICATION-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || stripeKey.startsWith("pk_")) {
      return json({ error: "Payment system not configured", code: "STRIPE_NOT_CONFIGURED" }, 500);
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid request format", code: "INVALID_REQUEST" }, 400);
    }

    const { priceId, certificationLabel, idempotency_key: idempotencyKey, amount_cents: amountCentsRaw } =
      body as Record<string, any>;

    if (!priceId || typeof priceId !== "string") {
      return json({ error: "Price ID is required", code: "INVALID_PRICE_ID" }, 400);
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const supabase = getServiceClient();
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Sign in to enroll", code: "AUTH_REQUIRED" }, 401);

    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authErr } = await anonClient.auth.getUser(token);
    const user = authData?.user;
    if (authErr || !user?.email) {
      return json({ error: "Sign in to enroll", code: "AUTH_FAILED" }, 401);
    }

    let customerId: string | undefined;
    try {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) customerId = customers.data[0].id;
    } catch (e) {
      log("WARN customer lookup failed", { error: String(e) });
    }

    // Idempotency
    if (typeof idempotencyKey === "string" && idempotencyKey.length > 0) {
      const existing = await findReusableOrder(supabase, idempotencyKey);
      if (existing && existing.status === "pending" && existing.checkout_url) {
        return json({
          success: true,
          reused: true,
          order_id: existing.id,
          checkout_url: existing.checkout_url,
          url: existing.checkout_url,
        });
      }
    }

    const order = await createPendingOrder(supabase, {
      productType: "certification",
      productKey: typeof certificationLabel === "string" ? certificationLabel : null,
      amountCents: Number.isFinite(Number(amountCentsRaw)) ? Number(amountCentsRaw) : 0,
      customerEmail: user.email,
      customerName: user.user_metadata?.full_name ?? null,
      userId: user.id,
      idempotencyKey: typeof idempotencyKey === "string" ? idempotencyKey : null,
      metadata: { price_id: priceId, certification_label: certificationLabel ?? null },
    });

    const origin = req.headers.get("origin") || "http://localhost:5173";

    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "payment",
        success_url: `${origin}/certifications?success=true&certification=${encodeURIComponent(certificationLabel || "")}`,
        cancel_url: `${origin}/certifications?canceled=true`,
        payment_intent_data: {
          receipt_email: user.email,
        },
        metadata: {
          user_id: user.id,
          certification_type: certificationLabel ?? "",
          payment_order_id: order.id,
          product_type: "certification",
        },
      });

      await attachStripeSession(supabase, order.id, session);
      log("checkout ready", { sessionId: session.id, orderId: order.id });

      return json({
        success: true,
        order_id: order.id,
        checkout_url: session.url,
        url: session.url,
      });
    } catch (stripeErr) {
      const message = stripeErr instanceof Error ? stripeErr.message : String(stripeErr);
      log("ERROR stripe session", { message });
      await markCheckoutFailed(supabase, order.id, message);
      notifyCheckoutFailed(supabase, {
        orderId: order.id,
        productType: "certification",
        customerEmail: user.email,
        customerName: user.user_metadata?.full_name ?? null,
        amountCents: Number.isFinite(Number(amountCentsRaw)) ? Number(amountCentsRaw) : 0,
        error: message,
      });
      return json(
        {
          error: "We saved your enrollment but couldn't open secure checkout.",
          code: "CHECKOUT_FAILED_FOLLOWUP",
          order_id: order.id,
        },
        502,
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR unexpected", { message });
    return json(
      { error: "An error occurred during checkout. Please try again.", code: "CHECKOUT_ERROR" },
      500,
    );
  }
});
