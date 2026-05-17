// verify-camp-payment — fallback fulfillment for camp registrations without webhooks.
// Called from /camp-success with the Stripe session_id. Retrieves the session via
// Stripe API, confirms payment_status === 'paid', and runs the same fulfillment
// the webhook would have done (status flip + parent + staff emails). Idempotent.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (step: string, details?: Record<string, unknown>) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[VERIFY-CAMP-PAYMENT] ${step}${d}`);
};

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });
const fmtMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sessionId } = await req.json().catch(() => ({}));
    if (!sessionId || typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      return new Response(JSON.stringify({ error: "Invalid session_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.source !== "camps") {
      return new Response(JSON.stringify({ error: "Not a camp session" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const registrationId = session.metadata?.registration_id;
    if (!registrationId) {
      return new Response(JSON.stringify({ error: "Missing registration_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supa = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: reg } = await supa
      .from("camp_registrations")
      .select("id, status, parent_email, parent_name, player_first_name, player_last_name, player_dob, player_age_at_registration, registration_type, amount_paid_cents, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, medical_notes, camp_id, cohort_id, cancel_token")
      .eq("id", registrationId)
      .maybeSingle();

    if (!reg) {
      return new Response(JSON.stringify({ error: "Registration not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (reg.status === "confirmed") {
      log("already confirmed", { registrationId });
      return new Response(JSON.stringify({ status: "confirmed", alreadyProcessed: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (session.payment_status !== "paid") {
      log("not paid yet", { registrationId, payment_status: session.payment_status });
      return new Response(JSON.stringify({ status: "pending", payment_status: session.payment_status }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Atomic flip — only if still pending_payment (prevents double-send if webhook ALSO fires later)
    const { data: updated, error: updErr } = await supa
      .from("camp_registrations")
      .update({
        status: "confirmed",
        paid_at: new Date().toISOString(),
        confirmed_at: new Date().toISOString(),
        stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
        stripe_checkout_session_id: session.id,
      })
      .eq("id", registrationId)
      .eq("status", "pending_payment")
      .select("id")
      .maybeSingle();

    if (updErr) {
      log("ERROR: update failed", { err: updErr.message });
      return new Response(JSON.stringify({ error: "Update failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Race lost: webhook (or another tab) confirmed it between read & write
    if (!updated) {
      log("race - already confirmed by another caller", { registrationId });
      return new Response(JSON.stringify({ status: "confirmed", alreadyProcessed: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch related data for emails
    const [{ data: camp }, { data: cohort }, { data: links }] = await Promise.all([
      supa.from("camps").select("name").eq("id", reg.camp_id).maybeSingle(),
      supa.from("camp_cohorts").select("age_label, venue_name, venue_address, venue_city, venue_state, venue_zip, daily_start_time, daily_end_time").eq("id", reg.cohort_id).maybeSingle(),
      supa.from("camp_registration_sessions").select("session_id, camp_sessions!inner(session_number, starts_on, ends_on)").eq("registration_id", registrationId),
    ]);

    const sessionsList = (links ?? [])
      .map((l: any) => l.camp_sessions)
      .sort((a: any, b: any) => a.session_number - b.session_number)
      .map((s: any) => `Week ${s.session_number}: ${fmtDate(s.starts_on)} – ${fmtDate(s.ends_on)}`);

    const dailyTime = cohort?.daily_start_time && cohort?.daily_end_time
      ? `${cohort.daily_start_time.slice(0, 5)} – ${cohort.daily_end_time.slice(0, 5)}, Mon–Fri`
      : "Mon–Fri";

    const venueAddress = cohort
      ? [cohort.venue_address, [cohort.venue_city, cohort.venue_state, cohort.venue_zip].filter(Boolean).join(" ")].filter(Boolean).join(", ")
      : "";

    const cancelUrl = `https://vault-baseball.lovable.app/camps/cancel/${reg.cancel_token}`;
    const calendarUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/camp-ics?registration_id=${registrationId}`;
    const confirmationNumber = `CAMP-${registrationId.slice(0, 8).toUpperCase()}`;
    const amountPaid = fmtMoney(reg.amount_paid_cents);
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const sendEmail = async (label: string, payload: Record<string, unknown>) => {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: anonKey, Authorization: `Bearer ${anonKey}` },
          body: JSON.stringify(payload),
        });
        const text = await res.text();
        log(`email:${label}`, { status: res.status, body: text.slice(0, 200) });
      } catch (err) {
        log(`email:${label} fetch failed`, { err: String(err) });
      }
    };

    await Promise.allSettled([
      sendEmail("camp-confirmation", {
        templateName: "camp-confirmation",
        recipientEmail: reg.parent_email,
        idempotencyKey: `camp-confirm-${registrationId}`,
        templateData: {
          playerName: reg.player_first_name,
          parentName: reg.parent_name,
          campName: camp?.name ?? "Summer Development Camp",
          cohortLabel: cohort?.age_label ?? "",
          venueName: cohort?.venue_name ?? "",
          venueAddress,
          dailyTime,
          sessionsList,
          registrationType: reg.registration_type,
          amountPaid,
          cancelUrl,
          calendarUrl,
          confirmationNumber,
        },
      }),
      ...["staff@methods22.com", "Eddie@methods22.com"].map((to) => sendEmail(`camp-staff-notification:${to}`, {
        templateName: "camp-staff-notification",
        recipientEmail: to,
        idempotencyKey: `camp-staff-${registrationId}-${to}`,
        templateData: {
          playerName: `${reg.player_first_name} ${reg.player_last_name}`,
          playerAge: reg.player_age_at_registration,
          playerDob: reg.player_dob,
          campName: camp?.name,
          cohortLabel: cohort?.age_label,
          venueName: cohort?.venue_name,
          sessionsList,
          registrationType: reg.registration_type,
          amountPaid,
          parentName: reg.parent_name,
          parentEmail: reg.parent_email,
          emergencyContactName: reg.emergency_contact_name,
          emergencyContactPhone: reg.emergency_contact_phone,
          emergencyRelationship: reg.emergency_contact_relationship,
          medicalNotes: reg.medical_notes,
          confirmationNumber,
        },
      })),
    ]);

    log("fulfilled", { registrationId });
    return new Response(JSON.stringify({ status: "confirmed", alreadyProcessed: false }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    log("ERROR", { err: e?.message });
    return new Response(JSON.stringify({ error: e?.message ?? "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
