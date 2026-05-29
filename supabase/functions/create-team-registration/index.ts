import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Mirror of src/lib/teamLevels.ts (kept in sync manually — short list).
const TEAM_LEVELS: Record<string, { label: string; tier: string; annualTuitionCents: number }> = {
  "9U-foundation": { label: "9U Foundation", tier: "Foundation", annualTuitionCents: 450000 },
  "10U-foundation": { label: "10U Foundation", tier: "Foundation", annualTuitionCents: 450000 },
  "11U-development": { label: "11U Development", tier: "Development", annualTuitionCents: 520000 },
  "12U-elite": { label: "12U Elite", tier: "Elite", annualTuitionCents: 550000 },
  "13U-premier": { label: "13U Premier", tier: "Premier", annualTuitionCents: 550000 },
  "14U-premier": { label: "14U Premier", tier: "Premier", annualTuitionCents: 600000 },
  "15U-elite": { label: "15U Elite", tier: "Elite", annualTuitionCents: 600000 },
  "16U-elite": { label: "16U Elite", tier: "Elite", annualTuitionCents: 600000 },
  "17U-elite": { label: "17U Elite", tier: "Elite", annualTuitionCents: 600000 },
};

const DEPOSIT_PERCENT = 0.25;
const INSTALLMENT_COUNT = 6;

function computePlan(total: number) {
  const deposit = Math.round(total * DEPOSIT_PERCENT);
  const remaining = total - deposit;
  const per = Math.ceil(remaining / INSTALLMENT_COUNT / 100) * 100;
  return { depositCents: deposit, installmentCount: INSTALLMENT_COUNT, installmentCents: per };
}

const str = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";
const email = (v: unknown) => str(v, 255).toLowerCase();
const phone = (v: unknown) => str(v, 32);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || stripeKey.startsWith("pk_")) {
      return json({ error: "Payment system not configured", code: "STRIPE_NOT_CONFIGURED" }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const {
      team_level_id,
      payment_plan,
      player_first_name,
      player_last_name,
      player_dob,
      player_position,
      parent_first_name,
      parent_last_name,
      parent_email,
      parent_phone,
      notes,
    } = body as Record<string, any>;

    const level = TEAM_LEVELS[String(team_level_id)];
    if (!level) return json({ error: "Invalid team selection", code: "INVALID_TEAM" }, 400);

    const plan = payment_plan === "installments" ? "installments" : "full";

    const pFirst = str(player_first_name, 80);
    const pLast = str(player_last_name, 80);
    const parFirst = str(parent_first_name, 80);
    const parLast = str(parent_last_name, 80);
    const parEmail = email(parent_email);
    const parPhone = phone(parent_phone);

    if (!pFirst || !pLast || !parFirst || !parLast || !parEmail || !parPhone) {
      return json({ error: "Missing required fields", code: "INVALID_REQUEST" }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parEmail)) {
      return json({ error: "Invalid email", code: "INVALID_EMAIL" }, 400);
    }

    const { depositCents, installmentCount, installmentCents } = computePlan(level.annualTuitionCents);
    const chargeNowCents = plan === "full" ? level.annualTuitionCents : depositCents;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: regRow, error: regError } = await supabase
      .from("team_registrations")
      .insert({
        team_level: level.label,
        tier: level.tier,
        annual_tuition_cents: level.annualTuitionCents,
        payment_plan: plan,
        deposit_cents: plan === "installments" ? depositCents : 0,
        installment_count: plan === "installments" ? installmentCount : 0,
        installment_cents: plan === "installments" ? installmentCents : 0,
        player_first_name: pFirst,
        player_last_name: pLast,
        player_dob: player_dob || null,
        player_position: str(player_position, 60) || null,
        parent_first_name: parFirst,
        parent_last_name: parLast,
        parent_email: parEmail,
        parent_phone: parPhone,
        notes: str(notes, 2000) || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (regError || !regRow) {
      console.error("[create-team-registration] insert failed", regError);
      return json({ error: "Could not save registration", code: "REG_INSERT_FAILED" }, 500);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const origin = req.headers.get("origin") || "https://vault-baseball.lovable.app";

    const productName =
      plan === "full"
        ? `${level.label} — Annual Tuition`
        : `${level.label} — Registration Deposit`;
    const description =
      plan === "full"
        ? `Full annual tuition for ${pFirst} ${pLast}.`
        : `Deposit of $${(depositCents / 100).toFixed(0)} today. Balance ($${((level.annualTuitionCents - depositCents) / 100).toFixed(0)}) over ${installmentCount} monthly installments of approx $${(installmentCents / 100).toFixed(0)}.`;

    // Reuse existing Stripe customer (linked by parent email) so a family that
    // previously paid for tryouts/camps shows up as the same customer record.
    let customerId: string | undefined;
    try {
      const existing = await stripe.customers.list({ email: parEmail, limit: 1 });
      if (existing.data[0]) {
        customerId = existing.data[0].id;
      } else {
        const created = await stripe.customers.create({
          email: parEmail,
          name: `${parFirst} ${parLast}`,
          phone: parPhone,
          metadata: { source: "team_registration" },
        });
        customerId = created.id;
      }
    } catch (e) {
      console.warn("[create-team-registration] customer lookup failed, falling back to customer_email", e);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ...(customerId ? { customer: customerId } : { customer_email: parEmail }),
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: chargeNowCents,
            product_data: { name: productName, description },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/teams/register/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/teams/register?canceled=1`,
      metadata: {
        source: "team_registration",
        registration_id: regRow.id,
        team_level: level.label,
        payment_plan: plan,
        parent_email: parEmail,
      },
    });

    await supabase
      .from("team_registrations")
      .update({ stripe_session_id: session.id })
      .eq("id", regRow.id);

    return json({ url: session.url, registration_id: regRow.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[create-team-registration] error", msg);
    return json({ error: msg, code: "CHECKOUT_ERROR" }, 500);
  }
});
