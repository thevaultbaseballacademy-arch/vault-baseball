// camp-ics — generates a multi-VEVENT calendar file for a camp registration.
// Each weekday of each enrolled session becomes its own event (Mon–Fri).

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function fmt(dt: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    dt.getUTCFullYear().toString() +
    p(dt.getUTCMonth() + 1) + p(dt.getUTCDate()) + "T" +
    p(dt.getUTCHours()) + p(dt.getUTCMinutes()) + p(dt.getUTCSeconds()) + "Z"
  );
}
function escapeIcs(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

// Build Date in America/New_York for given YYYY-MM-DD + HH:MM (treats input as ET wall clock)
function buildDateET(dateStr: string, timeStr: string): Date {
  // ET offset varies (EDT in summer = -04:00). Camps run June-July → EDT.
  return new Date(`${dateStr}T${timeStr}-04:00`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const registrationId = url.searchParams.get("registration_id");
    if (!registrationId) return new Response("Missing registration_id", { status: 400, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: reg } = await supabase
      .from("camp_registrations")
      .select("id, camp_id, cohort_id, player_first_name, player_last_name")
      .eq("id", registrationId).maybeSingle();
    if (!reg) return new Response("Not found", { status: 404, headers: corsHeaders });

    const [{ data: camp }, { data: cohort }, { data: links }] = await Promise.all([
      supabase.from("camps").select("name, description").eq("id", reg.camp_id).maybeSingle(),
      supabase.from("camp_cohorts").select("age_label, venue_name, venue_address, venue_city, venue_state, venue_zip, daily_start_time, daily_end_time").eq("id", reg.cohort_id).maybeSingle(),
      supabase.from("camp_registration_sessions").select("session_id, camp_sessions!inner(session_number, starts_on, ends_on)").eq("registration_id", registrationId),
    ]);

    if (!cohort) return new Response("Cohort missing", { status: 404, headers: corsHeaders });

    const startTime = (cohort.daily_start_time ?? "09:00:00").slice(0, 5);
    const endTime = (cohort.daily_end_time ?? "12:00:00").slice(0, 5);
    const venue = [cohort.venue_name, cohort.venue_address, cohort.venue_city && `${cohort.venue_city}, ${cohort.venue_state} ${cohort.venue_zip}`]
      .filter(Boolean).join(", ");
    const summary = `${camp?.name ?? "Camp"} — ${cohort.age_label ?? ""}`.trim();
    const description = `${reg.player_first_name} ${reg.player_last_name} · ${camp?.description ?? ""}`.trim();

    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//22M Baseball//Camps//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ];

    const sessions = (links ?? []).map((l: any) => l.camp_sessions);
    const stamp = fmt(new Date());

    for (const s of sessions) {
      // Iterate days from starts_on to ends_on inclusive, Mon–Fri only
      const start = new Date(s.starts_on + "T00:00:00Z");
      const end = new Date(s.ends_on + "T00:00:00Z");
      for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
        const dow = d.getUTCDay(); // 0=Sun..6=Sat
        if (dow === 0 || dow === 6) continue;
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(d.getUTCDate()).padStart(2, "0");
        const dateStr = `${yyyy}-${mm}-${dd}`;
        const dtStart = buildDateET(dateStr, startTime);
        const dtEnd = buildDateET(dateStr, endTime);
        lines.push(
          "BEGIN:VEVENT",
          `UID:camp-${registrationId}-${dateStr}@22mbaseball.com`,
          `DTSTAMP:${stamp}`,
          `DTSTART:${fmt(dtStart)}`,
          `DTEND:${fmt(dtEnd)}`,
          `SUMMARY:${escapeIcs(summary)}`,
          `LOCATION:${escapeIcs(venue)}`,
          `DESCRIPTION:${escapeIcs(description)}`,
          "STATUS:CONFIRMED",
          "END:VEVENT",
        );
      }
    }
    lines.push("END:VCALENDAR");

    return new Response(lines.join("\r\n"), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="camp-${registrationId}.ics"`,
      },
    });
  } catch (e: any) {
    console.error("camp-ics error", e);
    return new Response("Server error", { status: 500, headers: corsHeaders });
  }
});
