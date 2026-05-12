import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

type RegistrationPayload = {
  athlete_first_name?: string;
  athlete_last_name?: string;
  parent_email?: string;
  parent_phone?: string | null;
  registration_type?: string | null;
  pricing_tier?: string | null;
  amount_cents?: number | null;
  camp_location?: string | null;
  preferred_session?: string | null;
  selected_sessions?: string[] | null;
  [key: string]: unknown;
};

type ExistingRegistration = {
  id: string;
  status: string;
  stripe_session_id: string | null;
  created_at: string;
  parent_email: string;
  athlete_first_name: string;
  athlete_last_name: string;
  parent_phone: string | null;
  registration_type: string | null;
  pricing_tier: string | null;
  amount_cents: number | null;
  camp_location: string | null;
  preferred_session: string | null;
  selected_sessions: string[] | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const normalizeText = (value: unknown) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";

const normalizePhone = (value: unknown) =>
  typeof value === "string" ? value.replace(/\D+/g, "") : "";

const normalizeSessions = (value: unknown) =>
  Array.isArray(value)
    ? value.map((session) => String(session).trim().toLowerCase()).sort()
    : [];

const getSafeQuantity = (quantity: unknown) =>
  Math.max(1, Math.min(10, Number.isFinite(Number(quantity)) ? Math.floor(Number(quantity)) : 1));

const matchesExistingRegistration = (
  existing: ExistingRegistration,
  incoming: RegistrationPayload,
) => {
  const sameAthlete =
    normalizeText(existing.athlete_first_name) === normalizeText(incoming.athlete_first_name) &&
    normalizeText(existing.athlete_last_name) === normalizeText(incoming.athlete_last_name);

  const sameParent =
    normalizeText(existing.parent_email) === normalizeText(incoming.parent_email) &&
    normalizePhone(existing.parent_phone) === normalizePhone(incoming.parent_phone);

  const sameCampDetails =
    normalizeText(existing.registration_type) === normalizeText(incoming.registration_type) &&
    normalizeText(existing.pricing_tier) === normalizeText(incoming.pricing_tier) &&
    normalizeText(existing.camp_location) === normalizeText(incoming.camp_location) &&
    normalizeText(existing.preferred_session) === normalizeText(incoming.preferred_session) &&
    Number(existing.amount_cents ?? 0) === Number(incoming.amount_cents ?? 0);

  const existingSessions = normalizeSessions(existing.selected_sessions);
  const incomingSessions = normalizeSessions(incoming.selected_sessions);
  const sameSessions = JSON.stringify(existingSessions) === JSON.stringify(incomingSessions);

  const ageMs = Date.now() - new Date(existing.created_at).getTime();
  const withinRecoveryWindow = ageMs >= 0 && ageMs <= 1000 * 60 * 60 * 12;

  return withinRecoveryWindow && sameAthlete && sameParent && sameCampDetails && sameSessions;
};

const createCheckoutSession = async ({
  stripe,
  priceId,
  quantity,
  registrationId,
  parentEmail,
  successUrl,
  cancelUrl,
}: {
  stripe: Stripe;
  priceId: string;
  quantity: unknown;
  registrationId: string;
  parentEmail?: string;
  successUrl: string;
  cancelUrl: string;
}) => stripe.checkout.sessions.create({
  mode: "payment",
  payment_method_types: ["card"],
  customer_email: parentEmail,
  line_items: [{
    price: priceId,
    quantity: getSafeQuantity(quantity),
  }],
  success_url: successUrl,
  cancel_url: cancelUrl,
  allow_promotion_codes: true,
  metadata: {
    source: "summer-camp",
    registration_id: registrationId,
    parent_email: parentEmail ?? "",
  },
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || stripeKey.startsWith("pk_")) {
      return json({ error: "Payment system not configured", code: "STRIPE_NOT_CONFIGURED" }, 500);
    }

    const body = await req.json();
    const {
      priceId,
      quantity,
      successUrl,
      cancelUrl,
      paymentMethod,
      ...registration
    } = (body ?? {}) as RegistrationPayload & {
      priceId?: string;
      quantity?: unknown;
      successUrl?: string;
      cancelUrl?: string;
      paymentMethod?: "card" | "bank_transfer";
    };

    const method: "card" | "bank_transfer" = paymentMethod === "bank_transfer" ? "bank_transfer" : "card";

    if (method === "card" && (!priceId || typeof priceId !== "string")) {
      return json({ error: "Invalid price ID format", code: "INVALID_PRICE_ID" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const normalizedEmail = normalizeText(registration.parent_email);
    const origin = req.headers.get("origin") || "https://vault-baseball.lovable.app";
    const resolvedSuccessUrl = successUrl || `${origin}/summer-camp?paid=1&session_id={CHECKOUT_SESSION_ID}`;
    const resolvedCancelUrl = cancelUrl || `${origin}/summer-camp?canceled=1`;

    // === BANK TRANSFER PATH ===
    if (method === "bank_transfer") {
      const amountCents = Number(registration.amount_cents ?? 0);
      const { data: order, error: orderError } = await supabase
        .from("payment_orders")
        .insert({
          product_type: "summer_camp",
          amount_cents: amountCents,
          currency: "usd",
          payment_method: "bank_transfer",
          status: "pending_bank_transfer",
          customer_email: normalizedEmail,
          customer_name: `${registration.athlete_first_name ?? ""} ${registration.athlete_last_name ?? ""}`.trim() || null,
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
        console.error("[register-summer-camp] order insert failed", orderError);
        return json({ error: "Could not create order" }, 500);
      }

      const { data: regRow, error: regError } = await supabase
        .from("summer_camp_registrations")
        .insert({
          ...registration,
          parent_email: normalizedEmail,
          status: "pending_bank_transfer",
          payment_method: "bank_transfer",
          payment_order_id: order.id,
        })
        .select("id")
        .single();

      if (regError || !regRow) {
        console.error("[register-summer-camp] reg insert failed", regError);
        return json({ error: "Could not save registration" }, 500);
      }

      await supabase
        .from("payment_orders")
        .update({ product_id: regRow.id })
        .eq("id", order.id);

      // Fire-and-forget instructions email (best-effort)
      try {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "bank-transfer-instructions",
            recipientEmail: normalizedEmail,
            idempotencyKey: `bank-transfer-${order.id}`,
            templateData: {
              reference: order.reference_code,
              amountCents,
              campName: registration.camp_location,
              athleteName: `${registration.athlete_first_name ?? ""} ${registration.athlete_last_name ?? ""}`.trim(),
            },
          },
        });
      } catch (emailErr) {
        console.warn("[register-summer-camp] instructions email failed", emailErr);
      }

      return json({
        success: true,
        payment_method: "bank_transfer",
        registration_id: regRow.id,
        order_id: order.id,
        reference_code: order.reference_code,
        instructions_url: `${origin}/payment/bank-instructions/${order.id}`,
      });
    }

    const { data: recentRegistrations, error: lookupError } = await supabase
      .from("summer_camp_registrations")
      .select("id, status, stripe_session_id, created_at, parent_email, athlete_first_name, athlete_last_name, parent_phone, registration_type, pricing_tier, amount_cents, camp_location, preferred_session, selected_sessions")
      .eq("parent_email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(10);

    if (lookupError) {
      console.error("[register-summer-camp] lookup failed", lookupError);
    }

    const reusableRegistration = (recentRegistrations ?? [])
      .filter((candidate): candidate is ExistingRegistration => Boolean(candidate?.id))
      .find((candidate) => matchesExistingRegistration(candidate, {
        ...registration,
        parent_email: normalizedEmail,
      }));

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    let registrationId = reusableRegistration?.id ?? null;

    try {
      if (reusableRegistration?.stripe_session_id) {
        const existingSession = await stripe.checkout.sessions.retrieve(reusableRegistration.stripe_session_id);

        if (existingSession.payment_status === "paid") {
          await supabase
            .from("summer_camp_registrations")
            .update({
              status: "confirmed",
              paid_at: new Date().toISOString(),
              stripe_session_id: existingSession.id,
            })
            .eq("id", reusableRegistration.id);

          return json({
            success: true,
            already_paid: true,
            registration_id: reusableRegistration.id,
            stripe_session_id: existingSession.id,
            checkout_url: resolvedSuccessUrl.replace("{CHECKOUT_SESSION_ID}", existingSession.id),
          });
        }

        if (existingSession.status === "open" && existingSession.url) {
          return json({
            success: true,
            reused: true,
            registration_id: reusableRegistration.id,
            stripe_session_id: existingSession.id,
            checkout_url: existingSession.url,
          });
        }
      }

      if (!registrationId) {
        const { data: inserted, error: insertError } = await supabase
          .from("summer_camp_registrations")
          .insert({
            ...registration,
            parent_email: normalizedEmail,
            status: "pending_payment",
          })
          .select("id")
          .single();

        if (insertError || !inserted) {
          console.error("[register-summer-camp] insert failed", insertError);
          return json({ error: "Could not save registration" }, 500);
        }

        registrationId = inserted.id;
      }

      const session = await createCheckoutSession({
        stripe,
        priceId,
        quantity,
        registrationId,
        parentEmail: normalizedEmail,
        successUrl: resolvedSuccessUrl,
        cancelUrl: resolvedCancelUrl,
      });

      const { error: updateError } = await supabase
        .from("summer_camp_registrations")
        .update({ stripe_session_id: session.id, status: "pending_payment" })
        .eq("id", registrationId);

      if (updateError) {
        console.error("[register-summer-camp] session persist failed", updateError);
      }

      return json({
        success: true,
        registration_id: registrationId,
        stripe_session_id: session.id,
        checkout_url: session.url,
      });
    } catch (sessionError) {
      if (registrationId) {
        const { error: markFailedError } = await supabase
          .from("summer_camp_registrations")
          .update({ status: "payment_failed" })
          .eq("id", registrationId);

        if (markFailedError) {
          console.error("[register-summer-camp] failed to mark payment as failed", markFailedError);
        }
      }

      throw sessionError;
    }
  } catch (error) {
    console.error("register-summer-camp error", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error", code: "CHECKOUT_ERROR" }, 500);
  }
});