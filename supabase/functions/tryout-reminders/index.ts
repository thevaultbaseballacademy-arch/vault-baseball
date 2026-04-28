import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_BASE = "https://vault-baseball.lovable.app";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    weekday: "long", month: "long", day: "numeric",
    timeZone: "America/New_York",
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const now = Date.now();
  const windowStart = new Date(now + 23 * 3600 * 1000).toISOString();
  const windowEnd = new Date(now + 25 * 3600 * 1000).toISOString();

  const { data: events, error } = await supabase
    .from("tryout_events")
    .select("id, name, starts_at")
    .in("status", ["published", "closed"])
    .gte("starts_at", windowStart)
    .lte("starts_at", windowEnd);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let sent = 0;
  for (const ev of events ?? []) {
    const { data: regs } = await supabase
      .from("tryout_registrations")
      .select("id, parent_email, parent_name, player_first_name, cancel_token")
      .eq("event_id", ev.id)
      .in("status", ["pending", "confirmed"]);

    for (const r of regs ?? []) {
      try {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "tryout-reminder",
            recipientEmail: r.parent_email,
            idempotencyKey: `tryout-reminder-${r.id}-24h`,
            templateData: {
              playerName: r.player_first_name,
              parentName: r.parent_name,
              eventName: ev.name,
              eventDate: fmtDate(ev.starts_at),
              eventTime: "6:00 PM – 8:30 PM",
              cancelUrl: `${SITE_BASE}/tryouts/cancel/${r.cancel_token}`,
            },
          },
        });
        sent++;
      } catch (e) {
        console.warn("reminder send failed", r.id, e);
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, sent, events: events?.length ?? 0 }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
