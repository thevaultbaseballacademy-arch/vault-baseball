// register-for-camp — validates input, creates pending_payment registration via
// create_camp_registration_atomic RPC, then creates a Stripe Checkout Session.
// Fulfillment happens in camp-stripe-webhook.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { z } from "npm:zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RegSchema = z.object({
  camp_id: z.string().uuid(),
  cohort_id: z.string().uuid(),
  session_ids: z.array(z.string().uuid()).min(1).max(4),
  registration_type: z.enum(["weekly", "full_pass"]),
  player_first_name: z.string().trim().min(1).max(80),
  player_last_name: z.string().trim().min(1).max(80),
  player_dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  parent_name: z.string().trim().min(1).max(120),
  parent_email: z.string().trim().email().max(255),
  parent_phone: z.string().trim().min(7).max(40),
  emergency_contact_name: z.string().trim().min(1).max(120),
  emergency_contact_phone: z.string().trim().min(7).max(40),
  emergency_contact_relationship: z.string().trim().min(1).max(60),
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

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const parsed = RegSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, 400);
    }
    const data = parsed.data;

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || stripeKey.startsWith("pk_")) {
      return json({ error: "Stripe not configured" }, 500);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const t0 = Date.now();

    // Fail fast on full_pass shape before hitting the DB
    if (data.registration_type === "full_pass" && data.session_ids.length !== 4) {
      return json({ error: "Full Pass requires all 4 weeks selected" }, 400);
    }

    // Parallelize the three independent reads (camp + cohort + first session)
    const [campRes, cohortRes, firstSessionRes] = await Promise.all([
      supabase
        .from("camps")
        .select("id, name, status, weekly_price_cents, full_pass_price_cents, registration_opens_at, registration_closes_at")
        .eq("id", data.camp_id)
        .maybeSingle(),
      supabase
        .from("camp_cohorts")
        .select("id, age_min, age_max, age_label, venue_name")
        .eq("id", data.cohort_id)
        .maybeSingle(),
      supabase
        .from("camp_sessions")
        .select("starts_on")
        .in("id", data.session_ids)
        .order("starts_on", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);
    console.log(`[register-for-camp] reads ${Date.now() - t0}ms`);

    const camp = campRes.data;
    if (campRes.error || !camp) return json({ error: "Camp not found" }, 404);
    if (camp.status !== "published") return json({ error: "Registration is not open for this camp" }, 400);

    const now = Date.now();
    if (camp.registration_opens_at && now < new Date(camp.registration_opens_at).getTime()) {
      return json({ error: "Registration has not opened yet" }, 400);
    }
    if (camp.registration_closes_at && now > new Date(camp.registration_closes_at).getTime()) {
      return json({ error: "Registration is closed" }, 400);
    }

    const cohort = cohortRes.data;
    if (!cohort) return json({ error: "Cohort not found" }, 404);

    // Compute amount
    const amount =
      data.registration_type === "full_pass"
        ? camp.full_pass_price_cents
        : camp.weekly_price_cents * data.session_ids.length;

    const firstSession = firstSessionRes.data;
    const ageAt = ageOn(data.player_dob, firstSession ? new Date(firstSession.starts_on) : new Date());

    if (ageAt < cohort.age_min || ageAt > cohort.age_max) {
      return json({
        error: `This cohort is for ages ${cohort.age_min}–${cohort.age_max}. Player is ${ageAt}.`,
        age_mismatch: true,
      }, 400);
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") || null;

    // Atomic registration (capacity locks)
    const tRpc = Date.now();
    const { data: rpcRows, error: rpcErr } = await supabase.rpc("create_camp_registration_atomic", {
      p_camp_id: data.camp_id,
      p_cohort_id: data.cohort_id,
      p_session_ids: data.session_ids,
      p_registration_type: data.registration_type,
      p_amount_paid_cents: amount,
      p_player_first_name: data.player_first_name,
      p_player_last_name: data.player_last_name,
      p_player_dob: data.player_dob,
      p_player_age_at_registration: ageAt,
      p_parent_name: data.parent_name,
      p_parent_email: data.parent_email.toLowerCase(),
      p_parent_phone: data.parent_phone,
      p_emergency_contact_name: data.emergency_contact_name,
      p_emergency_contact_phone: data.emergency_contact_phone,
      p_emergency_contact_relationship: data.emergency_contact_relationship,
      p_medical_notes: data.medical_notes ?? null,
      p_waiver_signature_name: data.waiver_signature_name,
      p_waiver_ip: ip,
      p_photo_release_consent: data.photo_release_consent,
    });

    console.log(`[register-for-camp] rpc ${Date.now() - tRpc}ms`);
    if (rpcErr) {
      console.error("[register-for-camp] rpc error", rpcErr);
      return json({ error: "Could not create registration" }, 500);
    }
    const row = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;
    if (row?.conflict_code) {
      const map: Record<string, string> = {
        SESSION_FULL: "One of the selected weeks is full.",
        SESSION_NOT_OPEN: "One of the selected weeks is no longer open.",
        AGE_OUT_OF_RANGE: "Player age does not match this cohort.",
        COHORT_INVALID: "Cohort/camp mismatch.",
        CAMP_NOT_PUBLISHED: "Camp is not open for registration.",
        CAMP_NOT_FOUND: "Camp not found.",
      };
      return json({ error: map[row.conflict_code] ?? row.conflict_code, code: row.conflict_code, conflict_session_id: row.conflict_session_id }, 409);
    }
    const registrationId: string = row.registration_id;

    // Build Stripe checkout session
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") ?? "https://vault-baseball.lovable.app";

    const productName = data.registration_type === "full_pass"
      ? `${camp.name} — Full 4-Week Pass (${cohort.age_label})`
      : `${camp.name} — ${data.session_ids.length} Week${data.session_ids.length > 1 ? "s" : ""} (${cohort.age_label})`;

    const tStripe = Date.now();
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: data.parent_email.toLowerCase(),
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: productName,
            description: `Player: ${data.player_first_name} ${data.player_last_name}`,
          },
        },
      }],
      success_url: `${origin}/camps/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/camps?canceled=1&registration_id=${registrationId}`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min hold
      metadata: {
        source: "camps",
        registration_id: registrationId,
        camp_id: data.camp_id,
        cohort_id: data.cohort_id,
        registration_type: data.registration_type,
      },
    });
    console.log(`[register-for-camp] stripe ${Date.now() - tStripe}ms`);

    // Persist stripe_checkout_session_id in the background — webhook matches by
    // registration_id in metadata, so the response doesn't need to wait on this write.
    const persistSessionId = supabase
      .from("camp_registrations")
      .update({ stripe_checkout_session_id: checkoutSession.id })
      .eq("id", registrationId)
      .then(({ error }) => {
        if (error) console.error("[register-for-camp] session_id persist failed", error);
      });
    try {
      // @ts-ignore EdgeRuntime is provided by the Supabase Edge runtime
      if (typeof EdgeRuntime !== "undefined" && EdgeRuntime?.waitUntil) {
        // @ts-ignore
        EdgeRuntime.waitUntil(persistSessionId);
      }
    } catch (_) { /* no-op */ }

    console.log(`[register-for-camp] total ${Date.now() - t0}ms`);
    return json({
      success: true,
      registration_id: registrationId,
      checkout_url: checkoutSession.url,
      stripe_session_id: checkoutSession.id,
    });
  } catch (e: any) {
    console.error("register-for-camp error", e);
    return json({ error: e?.message ?? "Unknown error" }, 500);
  }
});
