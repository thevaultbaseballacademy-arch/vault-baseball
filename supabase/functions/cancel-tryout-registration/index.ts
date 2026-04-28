import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") ?? (await req.json().catch(() => ({}))).token;
    if (!token) {
      return json({ error: "Missing token" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Look up registration
    const { data: reg, error: lookupErr } = await supabase
      .from("tryout_registrations")
      .select("id, event_id, status, player_first_name, player_last_name, parent_email, parent_name, cancelled_at")
      .eq("cancel_token", token)
      .maybeSingle();

    if (lookupErr || !reg) {
      return json({ error: "Invalid or expired link" }, 404);
    }

    const { data: event } = await supabase
      .from("tryout_events")
      .select("id, name, starts_at")
      .eq("id", reg.event_id)
      .maybeSingle();

    // GET = preview/info
    if (req.method === "GET") {
      return json({
        valid: true,
        already_cancelled: reg.status === "cancelled" || !!reg.cancelled_at,
        player_name: `${reg.player_first_name} ${reg.player_last_name}`,
        event_name: event?.name,
        event_date: event?.starts_at,
      });
    }

    // POST = perform cancel
    if (reg.status === "cancelled" || reg.cancelled_at) {
      return json({ success: true, already_cancelled: true });
    }

    const { error: updErr } = await supabase
      .from("tryout_registrations")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", reg.id);

    if (updErr) {
      console.error("cancel update error", updErr);
      return json({ error: "Could not cancel" }, 500);
    }

    // Send cancellation email (best-effort)
    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "tryout-cancellation",
          recipientEmail: reg.parent_email,
          idempotencyKey: `tryout-cancel-${reg.id}`,
          templateData: {
            playerName: reg.player_first_name,
            eventName: event?.name ?? "your tryout",
          },
        },
      });
    } catch (e) {
      console.warn("cancel email failed", e);
    }

    return json({ success: true });
  } catch (e: any) {
    console.error("cancel-tryout-registration error", e);
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
