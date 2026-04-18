// ESSA Stripe webhook — fulfills package purchases by granting lesson_credits.
// Idempotent via essa_package_purchases.stripe_session_id (UNIQUE).
//
// Configure in Stripe Dashboard:
//   Endpoint URL: https://<project>.functions.supabase.co/essa-stripe-webhook
//   Events: checkout.session.completed
//   Copy the signing secret into STRIPE_WEBHOOK_SECRET.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Mirror of LESSON_PACKAGES in src/lib/essaPricing.ts.
// Keep this in sync if you change Stripe price IDs.
const PACKAGE_BY_PRICE: Record<string, { id: string; lessonCount: number }> = {
  price_1TNOqvPhXS410TO57n6EPrm5: { id: "pkg_5_hitting_fielding", lessonCount: 5 },
  price_1TNOqwPhXS410TO5qqKlobIP: { id: "pkg_10_hitting_fielding", lessonCount: 10 },
  price_1TNOqxPhXS410TO5GeIPgLoy: { id: "pkg_20_hitting_fielding", lessonCount: 20 },
  price_1TNOqzPhXS410TO5ztMq2ElV: { id: "pkg_5_pitching_catching", lessonCount: 5 },
  price_1TNOr0PhXS410TO567HKWXuI: { id: "pkg_10_pitching_catching", lessonCount: 10 },
  price_1TNOr0PhXS410TO5VRWDj8O7: { id: "pkg_20_pitching_catching", lessonCount: 20 },
};

const log = (step: string, details?: Record<string, unknown>) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[ESSA-WEBHOOK] ${step}${d}`);
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    log("ERROR: missing stripe config");
    return new Response("Stripe not configured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, webhookSecret);
  } catch (err) {
    log("ERROR: bad signature", { err: String(err) });
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response("ok", { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const sessionId = session.id;
  const userId = session.metadata?.user_id;
  const source = session.metadata?.source;

  // Only fulfill ESSA package sessions
  if (source !== "essa_facility" || !userId) {
    log("skip: not essa or no user", { source, userId });
    return new Response("ok", { status: 200 });
  }

  // Need price ID — re-fetch with line_items expanded
  let priceId = session.metadata?.price_id;
  if (!priceId) {
    const full = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price"],
    });
    priceId = full.line_items?.data?.[0]?.price?.id;
  }
  if (!priceId) return new Response("ok", { status: 200 });

  const pkg = PACKAGE_BY_PRICE[priceId];
  if (!pkg) {
    log("skip: not a package price", { priceId });
    return new Response("ok", { status: 200 });
  }

  const supa = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Idempotency: have we already fulfilled this session?
  const { data: existing } = await supa
    .from("essa_package_purchases")
    .select("id")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  if (existing) {
    log("already fulfilled", { sessionId });
    return new Response("ok", { status: 200 });
  }

  // 6-month expiration
  const expires = new Date();
  expires.setMonth(expires.getMonth() + 6);

  const { data: credit, error: credErr } = await supa
    .from("lesson_credits")
    .insert({
      user_id: userId,
      total_lessons: pkg.lessonCount,
      used_lessons: 0,
      credit_type: "purchased",
      source: "essa_facility",
      stripe_session_id: sessionId,
      expires_at: expires.toISOString(),
    })
    .select("id")
    .single();
  if (credErr) {
    log("ERROR: insert credit", { err: credErr.message });
    return new Response("error", { status: 500 });
  }

  await supa.from("essa_package_purchases").insert({
    user_id: userId,
    stripe_session_id: sessionId,
    stripe_price_id: priceId,
    package_id: pkg.id,
    lesson_count: pkg.lessonCount,
    amount_cents: session.amount_total ?? 0,
    credit_id: credit.id,
  });

  log("fulfilled", { userId, lessonCount: pkg.lessonCount, sessionId });
  return new Response("ok", { status: 200 });
});
