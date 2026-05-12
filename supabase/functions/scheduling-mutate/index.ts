// Scheduling OS — atomic create / update / cancel for facility_reservations
// Re-checks roles server-side (admin or coach), uses lock_facility_reservation_window
// for conflict detection (with buffers + blackouts), and writes scheduling_audit_log.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "https://esm.sh/zod@3.23.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const BookingFields = z.object({
  space_id: z.string().uuid(),
  coach_user_id: z.string().uuid().nullable().optional(),
  client_user_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(200),
  notes: z.string().max(2000).nullable().optional(),
  internal_notes: z.string().max(2000).nullable().optional(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  buffer_before_min: z.number().int().min(0).max(240).default(0),
  buffer_after_min: z.number().int().min(0).max(240).default(0),
  booking_type: z.enum([
    "in_person_lesson", "remote_lesson", "evaluation",
    "personal_training", "facility_reservation", "blackout",
  ]).optional(),
  attendee_count: z.number().int().min(1).max(500).optional(),
  reserved_for: z.string().max(200).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
});

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create"), idempotency_key: z.string().optional(), data: BookingFields }),
  z.object({
    action: z.literal("update"),
    reservation_id: z.string().uuid(),
    data: BookingFields.partial(),
  }),
  z.object({
    action: z.literal("cancel"),
    reservation_id: z.string().uuid(),
    reason: z.string().max(500).optional(),
  }),
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);

    // Per-request client to identify the caller
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes.user) return json({ error: "unauthorized" }, 401);
    const user = userRes.user;

    // Service client for privileged writes (we re-check role below)
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

    // Role check
    const { data: roles } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const isAdmin = !!roles?.some((r: any) => r.role === "admin" || r.role === "owner");
    const isCoach = !!roles?.some((r: any) => r.role === "coach");
    if (!isAdmin && !isCoach) return json({ error: "forbidden" }, 403);
    const actorRole = isAdmin ? "admin" : "coach";

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
    const payload = parsed.data;

    // --- CREATE ---
    if (payload.action === "create") {
      const d = payload.data;

      // Coaches can only create bookings for themselves
      if (!isAdmin) {
        if (d.coach_user_id && d.coach_user_id !== user.id) {
          return json({ error: "coaches can only book themselves" }, 403);
        }
        d.coach_user_id = user.id;
      }

      const { data: conflicts, error: confErr } = await admin.rpc("lock_facility_reservation_window", {
        p_space_id: d.space_id,
        p_coach_user_id: d.coach_user_id ?? null,
        p_starts_at: d.starts_at,
        p_ends_at: d.ends_at,
        p_buffer_before_min: d.buffer_before_min ?? 0,
        p_buffer_after_min: d.buffer_after_min ?? 0,
        p_exclude_reservation_id: null,
      });
      if (confErr) return json({ error: "conflict_check_failed", detail: confErr.message }, 500);
      if (conflicts && conflicts.length > 0) {
        return json({ error: "conflict", conflicts }, 409);
      }

      const { data: inserted, error: insErr } = await admin
        .from("facility_reservations")
        .insert({ ...d, status: "confirmed", created_by: user.id })
        .select()
        .single();
      if (insErr) return json({ error: insErr.message }, 400);

      await admin.from("scheduling_audit_log").insert({
        reservation_id: inserted.id,
        action: "create",
        actor_user_id: user.id,
        actor_role: actorRole,
        after_data: inserted,
      });

      return json({ ok: true, reservation: inserted });
    }

    // --- UPDATE / CANCEL share lookup ---
    const { data: existing, error: exErr } = await admin
      .from("facility_reservations")
      .select("*")
      .eq("id", payload.reservation_id)
      .maybeSingle();
    if (exErr || !existing) return json({ error: "not_found" }, 404);

    // Coaches can only mutate their own bookings
    if (!isAdmin && existing.coach_user_id !== user.id && existing.created_by !== user.id) {
      return json({ error: "forbidden" }, 403);
    }

    if (payload.action === "update") {
      const merged = { ...existing, ...payload.data };

      const { data: conflicts, error: confErr } = await admin.rpc("lock_facility_reservation_window", {
        p_space_id: merged.space_id,
        p_coach_user_id: merged.coach_user_id ?? null,
        p_starts_at: merged.starts_at,
        p_ends_at: merged.ends_at,
        p_buffer_before_min: merged.buffer_before_min ?? 0,
        p_buffer_after_min: merged.buffer_after_min ?? 0,
        p_exclude_reservation_id: existing.id,
      });
      if (confErr) return json({ error: "conflict_check_failed", detail: confErr.message }, 500);
      if (conflicts && conflicts.length > 0) return json({ error: "conflict", conflicts }, 409);

      const { data: updated, error: updErr } = await admin
        .from("facility_reservations")
        .update({ ...payload.data, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select()
        .single();
      if (updErr) return json({ error: updErr.message }, 400);

      await admin.from("scheduling_audit_log").insert({
        reservation_id: existing.id,
        action: "update",
        actor_user_id: user.id,
        actor_role: actorRole,
        before_data: existing,
        after_data: updated,
      });
      return json({ ok: true, reservation: updated });
    }

    // --- CANCEL ---
    const { data: cancelled, error: cancelErr } = await admin
      .from("facility_reservations")
      .update({
        status: "cancelled",
        cancellation_reason: payload.reason ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();
    if (cancelErr) return json({ error: cancelErr.message }, 400);

    await admin.from("scheduling_audit_log").insert({
      reservation_id: existing.id,
      action: "cancel",
      actor_user_id: user.id,
      actor_role: actorRole,
      reason: payload.reason ?? null,
      before_data: existing,
      after_data: cancelled,
    });
    return json({ ok: true, reservation: cancelled });
  } catch (e) {
    console.error("[scheduling-mutate] fatal", e);
    return json({ error: "internal_error", detail: String(e?.message ?? e) }, 500);
  }
});
