import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      ...registration
    } = body ?? {};

    if (!priceId || typeof priceId !== "string") {
      return json({ error: "Invalid price ID format", code: "INVALID_PRICE_ID" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: inserted, error: insertError } = await supabase
      .from("summer_camp_registrations")
      .insert({
        ...registration,
        parent_email: typeof registration.parent_email === "string"
          ? registration.parent_email.trim().toLowerCase()
          : registration.parent_email,
        status: "pending_payment",
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      console.error("[register-summer-camp] insert failed", insertError);
      return json({ error: "Could not save registration" }, 500);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://vault-baseball.lovable.app";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: registration.parent_email,
      line_items: [{
        price: priceId,
        quantity: Math.max(1, Math.min(10, Number.isFinite(Number(quantity)) ? Math.floor(Number(quantity)) : 1)),
      }],
      success_url: successUrl || `${origin}/summer-camp?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/summer-camp?canceled=1`,
      allow_promotion_codes: true,
      metadata: {
        source: "summer-camp",
        registration_id: inserted.id,
        parent_email: registration.parent_email ?? "",
      },
    });

    const { error: updateError } = await supabase
      .from("summer_camp_registrations")
      .update({ stripe_session_id: session.id })
      .eq("id", inserted.id);

    if (updateError) {
      console.error("[register-summer-camp] session persist failed", updateError);
    }

    return json({
      success: true,
      registration_id: inserted.id,
      stripe_session_id: session.id,
      checkout_url: session.url,
    });
  } catch (error) {
    console.error("register-summer-camp error", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error", code: "CHECKOUT_ERROR" }, 500);
  }
});