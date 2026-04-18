// ESSA Facility Checkout — one-time payments for private lessons & packages.
// Separate from create-checkout (subscriptions only) to keep concerns clean.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Whitelist of valid one-time facility price IDs (must match src/lib/essaPricing.ts)
const VALID_FACILITY_PRICE_IDS = new Set<string>([
  // Private lessons
  "price_1TNOqoPhXS410TO5GlOR65O9", // hitting
  "price_1TNOqpPhXS410TO5ftYKnyIo", // pitching (baseball + softball share price)
  "price_1TNOqqPhXS410TO50iQX5ica", // catching
  "price_1TNOqsPhXS410TO5eqyEZQmm", // fielding
  "price_1TNOqtPhXS410TO573t1vAda", // speed & agility
  // Packages — hitting/fielding
  "price_1TNOqvPhXS410TO57n6EPrm5", // 5-pack
  "price_1TNOqwPhXS410TO5qqKlobIP", // 10-pack
  "price_1TNOqxPhXS410TO5GeIPgLoy", // 20-pack
  // Packages — pitching/catching
  "price_1TNOqzPhXS410TO5ztMq2ElV", // 5-pack
  "price_1TNOr0PhXS410TO567HKWXuI", // 10-pack
  "price_1TNOr0PhXS410TO5VRWDj8O7", // 20-pack
]);

const log = (step: string, details?: Record<string, unknown>) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[ESSA-CHECKOUT] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || stripeKey.startsWith("pk_")) {
      log("ERROR: bad stripe key");
      return new Response(
        JSON.stringify({ error: "Payments not configured", code: "STRIPE_NOT_CONFIGURED" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let body: { priceId?: string; quantity?: number; metadata?: Record<string, string> };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body", code: "INVALID_REQUEST" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { priceId, quantity = 1, metadata = {} } = body;

    if (!priceId || typeof priceId !== "string" || !VALID_FACILITY_PRICE_IDS.has(priceId)) {
      log("ERROR: invalid price id", { priceId });
      return new Response(
        JSON.stringify({ error: "Invalid price ID", code: "INVALID_PRICE_ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const qty = Math.max(1, Math.min(20, Math.floor(Number(quantity) || 1)));

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Please sign in to book", code: "AUTH_REQUIRED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !userData.user?.email) {
      return new Response(
        JSON.stringify({ error: "Session expired. Please sign in again.", code: "AUTH_FAILED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const user = userData.user;
    log("user authenticated", { userId: user.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Re-use existing customer if available
    let customerId: string | undefined;
    try {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) customerId = customers.data[0].id;
    } catch (e) {
      log("WARN: customer lookup failed", { error: String(e) });
    }

    const origin = req.headers.get("origin") || "https://vault-baseball.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: qty }],
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&source=essa`,
      cancel_url: `${origin}/facility/scheduling?canceled=1`,
      allow_promotion_codes: true,
      metadata: {
        ...metadata,
        user_id: user.id,
        source: "essa_facility",
        price_id: priceId,
      },
    });

    log("session created", { sessionId: session.id });
    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { msg });
    return new Response(
      JSON.stringify({ error: "Checkout failed. Please try again.", code: "CHECKOUT_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
