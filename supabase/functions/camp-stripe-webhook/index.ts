// camp-stripe-webhook — fulfills camp registrations on checkout.session.completed.
// Idempotent: only flips pending_payment → confirmed once per stripe_checkout_session_id.
//
// Configure in Stripe Dashboard:
//   Endpoint: https://<project>.functions.supabase.co/camp-stripe-webhook
//   Events: checkout.session.completed, checkout.session.expired, payment_intent.payment_failed
//   Signing secret -> CAMP_STRIPE_WEBHOOK_SECRET

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const log = (step: string, details?: Record<string, unknown>) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CAMP-WEBHOOK] ${step}${d}`);
};

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", timeZone: "America/New_York",
  });
}
function fmtMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("CAMP_STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    log("ERROR: missing stripe config", { hasKey: !!stripeKey, hasSecret: !!webhookSecret });
    return new Response("Stripe not configured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, webhookSecret);
  } catch (err) {
    log("ERROR: bad signature", { err: String(err) });
    return new Response("Invalid signature", { status: 400 });
  }

  const supa = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Handle both legacy `camps` and new `summer-camp` flows.
  const session = event.data.object as Stripe.Checkout.Session;
  const source = session.metadata?.source;

  if (source === "summer-camp") {
    return await handleSummerCamp(event, session, supa);
  }

  if (source !== "camps") {
    return new Response("ok", { status: 200 });
  }

  const registrationId = session.metadata?.registration_id;
  if (!registrationId) {
    log("missing registration_id");
    return new Response("ok", { status: 200 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      // Idempotency check
      const { data: reg } = await supa
        .from("camp_registrations")
        .select("id, status, parent_email, parent_name, player_first_name, player_last_name, player_dob, player_age_at_registration, registration_type, amount_paid_cents, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, medical_notes, camp_id, cohort_id, cancel_token")
        .eq("id", registrationId)
        .maybeSingle();
      if (!reg) { log("registration not found"); return new Response("ok", { status: 200 }); }
      if (reg.status === "confirmed") { log("already confirmed", { registrationId }); return new Response("ok", { status: 200 }); }

      const { error: updErr } = await supa
        .from("camp_registrations")
        .update({
          status: "confirmed",
          paid_at: new Date().toISOString(),
          confirmed_at: new Date().toISOString(),
          stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
          stripe_checkout_session_id: session.id,
        })
        .eq("id", registrationId)
        .eq("status", "pending_payment");
      if (updErr) {
        log("ERROR: update failed", { err: updErr.message });
        return new Response("error", { status: 500 });
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
        ? `${cohort.daily_start_time.slice(0,5)} – ${cohort.daily_end_time.slice(0,5)}, Mon–Fri`
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
          log(`email:${label}`, { status: res.status, body: text.slice(0, 300) });
        } catch (err) {
          log(`email:${label} fetch failed`, { err: String(err) });
        }
      };

      // Await both — never use waitUntil for email sends (see register-for-tryout learnings)
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
            parentPhone: (reg as any).parent_phone,
            emergencyContactName: reg.emergency_contact_name,
            emergencyContactPhone: reg.emergency_contact_phone,
            emergencyRelationship: reg.emergency_contact_relationship,
            medicalNotes: reg.medical_notes,
            confirmationNumber,
          },
        }),
      ]);

      log("fulfilled", { registrationId });
      return new Response("ok", { status: 200 });
    }

    if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
      // Release the seat — only if still pending
      await supa
        .from("camp_registrations")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", registrationId)
        .eq("status", "pending_payment");
      log("released pending registration", { registrationId, type: event.type });
      return new Response("ok", { status: 200 });
    }

    return new Response("ok", { status: 200 });
  } catch (e: any) {
    log("ERROR: handler", { err: e?.message });
    return new Response("error", { status: 500 });
  }
});

// ───────────────────────── SUMMER CAMP HANDLER ─────────────────────────
// Finalizes summer_camp_registrations + payment_orders, sends parent confirmation
// and staff notification. Idempotent on stripe_session_id.
async function handleSummerCamp(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
  supa: ReturnType<typeof createClient>,
): Promise<Response> {
  const registrationId = session.metadata?.registration_id;
  const paymentOrderId = session.metadata?.payment_order_id;
  if (!registrationId) {
    log("[summer-camp] missing registration_id");
    return new Response("ok", { status: 200 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const { data: reg } = await supa
        .from("summer_camp_registrations")
        .select("id, status, parent_email, parent_name, parent_phone, athlete_first_name, athlete_last_name, athlete_age, camp_location, registration_type, selected_sessions, amount_cents, emergency_contact, medical_notes, tshirt_size, payment_order_id")
        .eq("id", registrationId)
        .maybeSingle();

      if (!reg) {
        log("[summer-camp] registration not found", { registrationId });
        return new Response("ok", { status: 200 });
      }

      if (reg.status === "confirmed") {
        log("[summer-camp] already confirmed", { registrationId });
        return new Response("ok", { status: 200 });
      }

      const paidAt = new Date().toISOString();
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

      const { error: updErr } = await supa
        .from("summer_camp_registrations")
        .update({
          status: "confirmed",
          paid_at: paidAt,
          stripe_session_id: session.id,
        })
        .eq("id", registrationId)
        .neq("status", "confirmed");

      if (updErr) {
        log("[summer-camp] reg update failed", { err: updErr.message });
        return new Response("error", { status: 500 });
      }

      const orderId = reg.payment_order_id ?? paymentOrderId;
      if (orderId) {
        await supa
          .from("payment_orders")
          .update({
            status: "paid",
            paid_at: paidAt,
            stripe_session_id: session.id,
            stripe_payment_intent_id: paymentIntentId,
          })
          .eq("id", orderId);
      }

      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
      const athleteName = `${reg.athlete_first_name ?? ""} ${reg.athlete_last_name ?? ""}`.trim();
      const amountPaid = fmtMoney(reg.amount_cents ?? 0);
      const confirmationNumber = `CAMP-${registrationId.slice(0, 8).toUpperCase()}`;

      const sendEmail = async (label: string, payload: Record<string, unknown>) => {
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
          log(`[summer-camp] email:${label}`, { status: res.status, body: text.slice(0, 200) });
        } catch (err) {
          log(`[summer-camp] email:${label} failed`, { err: String(err) });
        }
      };

      await Promise.allSettled([
        sendEmail("parent-confirmation", {
          templateName: "summer-camp-confirmation",
          recipientEmail: reg.parent_email,
          idempotencyKey: `summer-camp-confirm-${registrationId}`,
          templateData: {
            parentName: reg.parent_name,
            athleteName,
            campLocation: reg.camp_location,
            registrationType: reg.registration_type,
            selectedSessions: reg.selected_sessions,
            amountPaid,
            confirmationNumber,
          },
        }),
        sendEmail("staff-notification", {
          templateName: "summer-camp-staff-notification",
          recipientEmail: "staff@methods22.com",
          idempotencyKey: `summer-camp-staff-${registrationId}`,
          templateData: {
            athleteName,
            athleteAge: reg.athlete_age,
            campLocation: reg.camp_location,
            registrationType: reg.registration_type,
            selectedSessions: reg.selected_sessions,
            amountPaid,
            parentName: reg.parent_name,
            parentEmail: reg.parent_email,
            parentPhone: reg.parent_phone,
            emergencyContact: reg.emergency_contact,
            medicalNotes: reg.medical_notes,
            tshirtSize: reg.tshirt_size,
            confirmationNumber,
          },
        }),
      ]);

      log("[summer-camp] fulfilled", { registrationId });
      return new Response("ok", { status: 200 });
    }

    if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
      await supa
        .from("summer_camp_registrations")
        .update({ status: "checkout_expired" })
        .eq("id", registrationId)
        .eq("status", "pending_payment");

      const orderId = paymentOrderId;
      if (orderId) {
        await supa
          .from("payment_orders")
          .update({
            status: event.type === "checkout.session.expired" ? "expired" : "failed",
            error_message: `Stripe event: ${event.type}`,
            follow_up_required: true,
            follow_up_reason: event.type,
          })
          .eq("id", orderId)
          .neq("status", "paid");
      }

      log("[summer-camp] released pending", { registrationId, type: event.type });
      return new Response("ok", { status: 200 });
    }

    return new Response("ok", { status: 200 });
  } catch (e: any) {
    log("[summer-camp] handler error", { err: e?.message });
    return new Response("error", { status: 500 });
  }
}
