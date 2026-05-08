// cancel-camp-registration — GET previews; POST cancels.
// Cancels release seat (status=cancelled). Refund handling is operational, not automated here.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    let token = url.searchParams.get("token");
    if (!token && req.method !== "GET") {
      try { token = (await req.json())?.token ?? null; } catch { /* noop */ }
    }
    if (!token) return json({ error: "Missing token" }, 400);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: reg, error: lookupErr } = await supabase
      .from("camp_registrations")
      .select("id, camp_id, cohort_id, status, player_first_name, player_last_name, parent_email, parent_name, cancelled_at")
      .eq("cancel_token", token)
      .maybeSingle();
    if (lookupErr || !reg) return json({ error: "Invalid or expired link" }, 404);

    const { data: camp } = await supabase.from("camps").select("name").eq("id", reg.camp_id).maybeSingle();

    if (req.method === "GET") {
      return json({
        valid: true,
        already_cancelled: reg.status === "cancelled" || !!reg.cancelled_at,
        player_name: `${reg.player_first_name} ${reg.player_last_name}`,
        camp_name: camp?.name,
        status: reg.status,
      });
    }

    if (reg.status === "cancelled" || reg.cancelled_at) {
      return json({ success: true, already_cancelled: true });
    }

    const wasPaid = reg.status === "confirmed";
    const { error: updErr } = await supabase
      .from("camp_registrations")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", reg.id);
    if (updErr) {
      console.error("cancel update error", updErr);
      return json({ error: "Could not cancel" }, 500);
    }

    // Best-effort cancellation email
    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "camp-cancellation",
          recipientEmail: reg.parent_email,
          idempotencyKey: `camp-cancel-${reg.id}`,
          templateData: {
            playerName: reg.player_first_name,
            campName: camp?.name ?? "your camp",
            refundNote: wasPaid
              ? "A staff member will follow up about your refund per our cancellation policy within 1 business day."
              : undefined,
          },
        },
      });
    } catch (e) {
      console.warn("camp cancel email failed", e);
    }

    return json({ success: true, was_paid: wasPaid });
  } catch (e: any) {
    console.error("cancel-camp-registration error", e);
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});
