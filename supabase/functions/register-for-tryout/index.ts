import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RegistrationSchema = z.object({
  event_id: z.string().uuid(),
  player_first_name: z.string().trim().min(1).max(80),
  player_last_name: z.string().trim().min(1).max(80),
  player_dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  player_throwing_hand: z.enum(["Right", "Left"]),
  player_position: z.string().trim().max(40).optional().nullable(),
  player_current_team: z.string().trim().max(120).optional().nullable(),
  player_experience: z.string().trim().max(200).optional().nullable(),
  parent_name: z.string().trim().min(1).max(120),
  parent_email: z.string().trim().email().max(255),
  parent_phone: z.string().trim().min(7).max(40),
  emergency_contact_name: z.string().trim().min(1).max(120),
  emergency_contact_phone: z.string().trim().min(7).max(40),
  emergency_relationship: z.string().trim().min(1).max(60),
  medical_notes: z.string().trim().max(1000).optional().nullable(),
  photo_release_consent: z.boolean(),
  waiver_accepted: z.literal(true),
  waiver_signature_name: z.string().trim().min(1).max(120),
});

function ageOn(dob: string, on: Date): number {
  const d = new Date(dob);
  let age = on.getFullYear() - d.getFullYear();
  const m = on.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && on.getDate() < d.getDate())) age--;
  return age;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const parsed = RegistrationSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const data = parsed.data;

    // Service role for trusted server-side write
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Load event
    const { data: event, error: evtErr } = await supabase
      .from("tryout_events")
      .select("id, name, status, starts_at, age_group, capacity, waitlist_capacity")
      .eq("id", data.event_id)
      .maybeSingle();

    if (evtErr || !event) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (event.status !== "published") {
      return new Response(JSON.stringify({ error: "Registration is not open for this event" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (new Date(event.starts_at).getTime() <= Date.now()) {
      return new Response(JSON.stringify({ error: "This event has already started" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Age validation
    const age = ageOn(data.player_dob, new Date(event.starts_at));
    const [minA, maxA] = event.age_group.split("-").map((n: string) => parseInt(n, 10));
    if (age < minA || age > maxA) {
      return new Response(
        JSON.stringify({
          error: `This event is for ages ${event.age_group}. Player appears to be ${age}.`,
          age_mismatch: true,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Capacity check
    const { count: confirmedCount } = await supabase
      .from("tryout_registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .in("status", ["confirmed", "pending"]);

    let assignedStatus: "pending" | "waitlisted" = "pending";
    let waitlistPosition: number | null = null;

    if ((confirmedCount ?? 0) >= event.capacity) {
      const { count: waitlistCount } = await supabase
        .from("tryout_registrations")
        .select("id", { count: "exact", head: true })
        .eq("event_id", event.id)
        .eq("status", "waitlisted");
      if ((waitlistCount ?? 0) >= event.waitlist_capacity) {
        return new Response(JSON.stringify({ error: "This event and its waitlist are full" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      assignedStatus = "waitlisted";
      waitlistPosition = (waitlistCount ?? 0) + 1;
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") || null;

    const { data: inserted, error: insErr } = await supabase
      .from("tryout_registrations")
      .insert({
        event_id: data.event_id,
        player_first_name: data.player_first_name,
        player_last_name: data.player_last_name,
        player_dob: data.player_dob,
        player_throwing_hand: data.player_throwing_hand,
        player_position: data.player_position || null,
        player_current_team: data.player_current_team || null,
        player_experience: data.player_experience || null,
        parent_name: data.parent_name,
        parent_email: data.parent_email.toLowerCase(),
        parent_phone: data.parent_phone,
        emergency_contact_name: data.emergency_contact_name,
        emergency_contact_phone: data.emergency_contact_phone,
        emergency_relationship: data.emergency_relationship,
        medical_notes: data.medical_notes || null,
        photo_release_consent: data.photo_release_consent,
        waiver_signature_name: data.waiver_signature_name,
        waiver_ip: ip,
        status: assignedStatus,
      })
      .select("id, status, cancel_token")
      .single();

    if (insErr) {
      console.error("Insert error", insErr);
      return new Response(JSON.stringify({ error: "Could not save registration" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send confirmation email (best-effort — never block registration)
    try {
      const eventDate = new Date(event.starts_at).toLocaleString("en-US", {
        weekday: "long", month: "long", day: "numeric",
        timeZone: "America/New_York",
      });
      const eventTime = new Date(event.starts_at).toLocaleString("en-US", {
        hour: "numeric", minute: "2-digit", timeZone: "America/New_York",
      }) + " – 8:30 PM";
      const cancelUrl = `https://vault-baseball.lovable.app/tryouts/cancel/${inserted.cancel_token}`;

      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "tryout-confirmation",
          recipientEmail: data.parent_email.toLowerCase(),
          idempotencyKey: `tryout-confirm-${inserted.id}`,
          templateData: {
            playerName: data.player_first_name,
            parentName: data.parent_name,
            eventName: (event as any).name ?? "Spring 2026 Tryout",
            eventDate,
            eventTime,
            cancelUrl,
          },
        },
      });
    } catch (emailErr) {
      console.warn("Confirmation email failed", emailErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        registration_id: inserted.id,
        status: inserted.status,
        waitlist_position: waitlistPosition,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("register-for-tryout error", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
