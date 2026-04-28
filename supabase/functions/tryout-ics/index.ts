import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FACILITY = "22M Training Facility, 31 Park Rd, Tinton Falls, NJ 07724";

function fmt(dt: Date): string {
  // YYYYMMDDTHHMMSSZ
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    dt.getUTCFullYear().toString() +
    p(dt.getUTCMonth() + 1) +
    p(dt.getUTCDate()) +
    "T" +
    p(dt.getUTCHours()) +
    p(dt.getUTCMinutes()) +
    p(dt.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const eventId = url.searchParams.get("event_id");
    if (!eventId) {
      return new Response("Missing event_id", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: evt, error } = await supabase
      .from("tryout_events")
      .select("id, name, starts_at, ends_at, location_name, address, description")
      .eq("id", eventId)
      .maybeSingle();

    if (error || !evt) {
      return new Response("Event not found", { status: 404, headers: corsHeaders });
    }

    const dtStart = new Date(evt.starts_at);
    const dtEnd = evt.ends_at ? new Date(evt.ends_at) : new Date(dtStart.getTime() + 2.5 * 60 * 60 * 1000);
    const location = evt.address ? `${evt.location_name}, ${evt.address}` : (evt.location_name || FACILITY);

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//22M Baseball//Tryouts//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:tryout-${evt.id}@22mbaseball.com`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(dtStart)}`,
      `DTEND:${fmt(dtEnd)}`,
      `SUMMARY:${escapeIcs(evt.name)}`,
      `LOCATION:${escapeIcs(location)}`,
      `DESCRIPTION:${escapeIcs(evt.description || "Bring glove, cleats/turfs, and water.")}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    return new Response(ics, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="tryout-${evt.id}.ics"`,
      },
    });
  } catch (e: any) {
    console.error("tryout-ics error", e);
    return new Response("Server error", { status: 500, headers: corsHeaders });
  }
});
