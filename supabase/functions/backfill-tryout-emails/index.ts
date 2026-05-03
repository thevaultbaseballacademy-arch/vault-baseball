// One-off backfill: re-send staff + parent confirmation emails for tryout
// registrations whose emails were lost when EdgeRuntime.waitUntil dropped them.
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function ageOn(dob: string, on: Date): number {
  const d = new Date(dob);
  let age = on.getFullYear() - d.getFullYear();
  const m = on.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < d.getDate())) age--;
  return age;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, serviceKey);

  // Pull registrations missing a logged staff notification since May 2.
  const { data: regs, error } = await supabase
    .from("tryout_registrations")
    .select("*, tryout_events(name, starts_at)")
    .gte("created_at", "2026-05-02T00:00:00Z");

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });

  const endpoint = `${supabaseUrl}/functions/v1/send-transactional-email`;
  const results: any[] = [];

  for (const r of regs ?? []) {
    const event = (r as any).tryout_events;
    if (!event) continue;

    const eventDate = new Date(event.starts_at).toLocaleString("en-US", {
      weekday: "long", month: "long", day: "numeric", timeZone: "America/New_York",
    });
    const eventTime = new Date(event.starts_at).toLocaleString("en-US", {
      hour: "numeric", minute: "2-digit", timeZone: "America/New_York",
    }) + " – 8:30 PM";
    const age = ageOn(r.player_dob, new Date(event.starts_at));
    const confirmationNumber = r.id.slice(0, 8).toUpperCase();
    const cancelUrl = `https://vault-baseball.lovable.app/tryouts/cancel/${r.cancel_token}`;
    const calendarUrl = `${supabaseUrl}/functions/v1/tryout-ics?event_id=${r.event_id}`;

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const send = async (label: string, payload: Record<string, unknown>) => {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`,
          },
          body: JSON.stringify(payload),
        });
        const text = await res.text();
        results.push({ id: r.id, label, status: res.status, body: text.slice(0, 400) });
      } catch (e: any) {
        results.push({ id: r.id, label, error: e?.message });
      }
    };

    await send("staff", {
      templateName: "tryout-staff-notification",
      recipientEmail: "staff@methods22.com",
      idempotencyKey: `tryout-staff-backfill-${r.id}`,
      templateData: {
        playerName: `${r.player_first_name} ${r.player_last_name}`,
        playerAge: age,
        playerDob: r.player_dob,
        throwingHand: r.player_throwing_hand,
        position: r.player_position,
        currentTeam: r.player_current_team,
        parentName: r.parent_name,
        parentEmail: r.parent_email,
        parentPhone: r.parent_phone,
        emergencyContactName: r.emergency_contact_name,
        emergencyContactPhone: r.emergency_contact_phone,
        emergencyRelationship: r.emergency_relationship,
        medicalNotes: r.medical_notes,
        eventName: event.name,
        eventDate,
        eventTime,
        registrationStatus: r.status,
        waitlistPosition: null,
      },
    });

    // Skip parent confirmations for QA test addresses.
    if (!r.parent_email.includes("example.com")) {
      await send("parent", {
        templateName: "tryout-confirmation",
        recipientEmail: r.parent_email,
        idempotencyKey: `tryout-confirm-backfill-${r.id}`,
        templateData: {
          playerName: r.player_first_name,
          parentName: r.parent_name,
          eventName: event.name,
          eventDate,
          eventTime,
          cancelUrl,
          calendarUrl,
          confirmationNumber,
        },
      });
    }
  }

  return new Response(JSON.stringify({ count: regs?.length ?? 0, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
