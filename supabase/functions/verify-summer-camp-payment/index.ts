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
    if (!stripeKey) return json({ error: "Stripe not configured" }, 500);

    const { sessionId } = await req.json().catch(() => ({}));
    if (!sessionId || typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      return json({ error: "Invalid session_id" }, 400);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.source !== "summer-camp") {
      return json({ error: "Not a summer camp session" }, 400);
    }

    const registrationId = session.metadata?.registration_id;
    if (!registrationId) return json({ error: "Missing registration_id" }, 400);
    if (session.payment_status !== "paid") {
      return json({ status: "pending", payment_status: session.payment_status });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: existing } = await supabase
      .from("summer_camp_registrations")
      .select("id, status, parent_email, parent_phone")
      .eq("id", registrationId)
      .maybeSingle();

    if (!existing) return json({ error: "Registration not found" }, 404);

    if (existing.status !== "confirmed") {
      const { error: updateError } = await supabase
        .from("summer_camp_registrations")
        .update({
          status: "confirmed",
          paid_at: new Date().toISOString(),
          stripe_session_id: session.id,
        })
        .eq("id", registrationId);

      if (updateError) {
        console.error("[verify-summer-camp-payment] update failed", updateError);
        return json({ error: "Could not finalize registration" }, 500);
      }
    }

    return json({
      status: "confirmed",
      registrationId,
      parentEmail: existing.parent_email,
      parentPhone: existing.parent_phone,
    });
  } catch (error) {
    console.error("verify-summer-camp-payment error", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});