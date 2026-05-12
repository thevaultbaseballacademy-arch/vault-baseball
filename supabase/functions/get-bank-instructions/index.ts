import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const DEFAULTS = {
  account_name: "Vault Sports Performance",
  bank_name: "Contact us for bank details",
  account_number: "(provided after registration)",
  routing_number: "(provided after registration)",
  payment_deadline_days: 5,
  support_email: "support@methods22.com",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");
    if (!orderId) return json({ error: "orderId required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: order, error } = await admin
      .from("payment_orders")
      .select("id, reference_code, amount_cents, currency, status, customer_email, customer_name, product_type, created_at")
      .eq("id", orderId)
      .maybeSingle();

    if (error) return json({ error: error.message }, 500);
    if (!order) return json({ error: "Order not found" }, 404);

    let instructions = DEFAULTS;
    const raw = Deno.env.get("BANK_TRANSFER_INSTRUCTIONS_JSON");
    if (raw) {
      try {
        instructions = { ...DEFAULTS, ...JSON.parse(raw) };
      } catch (e) {
        console.warn("BANK_TRANSFER_INSTRUCTIONS_JSON parse failed", e);
      }
    }

    return json({ order, instructions });
  } catch (err) {
    console.error("get-bank-instructions error", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
