import { supabase } from "@/integrations/supabase/client";

/**
 * Day 6 — naive time-intersection query.
 *
 * Returns slot starts (ISO) in the next `daysAhead` days where the chosen
 * space + (optional) coach are BOTH free for `durationMinutes`, intersected
 * against the facility's daily operating hours.
 *
 * At ~200 reservations / one facility this is well under 500ms in practice.
 * If we exceed that on real data, Day 7 will optimize before alternatives ship
 * (per acceptance brief). Keeping it readable now is the right call.
 */

export type FacilityHoursLite = {
  day_of_week: number; // 0 = Sun
  open_time: string;   // 'HH:MM:SS'
  close_time: string;  // 'HH:MM:SS'
  is_closed: boolean;
};

export type IntersectionInput = {
  spaceId: string;
  coachUserId: string | null;
  durationMinutes: number;
  daysAhead?: number; // default 14
  slotStepMinutes?: number; // default 30
  hours: FacilityHoursLite[];
};

export type FreeSlot = { start: Date; end: Date };

const parseHM = (hms: string): { h: number; m: number } => {
  const [h, m] = hms.split(":").map(Number);
  return { h: h ?? 0, m: m ?? 0 };
};

const overlaps = (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) =>
  aStart < bEnd && aEnd > bStart;

export async function findIntersectingSlots(
  input: IntersectionInput,
): Promise<FreeSlot[]> {
  const {
    spaceId,
    coachUserId,
    durationMinutes,
    daysAhead = 14,
    slotStepMinutes = 30,
    hours,
  } = input;

  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setSeconds(0, 0);
  const rangeEnd = new Date(now);
  rangeEnd.setDate(rangeEnd.getDate() + daysAhead);

  // 1) Pull all reservations in the window that touch our space OR coach.
  //    One round-trip; we filter client-side by resource. RPC for this would
  //    be premature optimization at current scale.
  const { data: spaceRows, error: spaceErr } = await supabase
    .from("facility_reservations" as any)
    .select("starts_at,ends_at,space_id,coach_user_id,status")
    .eq("space_id", spaceId)
    .neq("status", "cancelled")
    .lt("starts_at", rangeEnd.toISOString())
    .gt("ends_at", rangeStart.toISOString());
  if (spaceErr) throw spaceErr;

  let coachRows: any[] = [];
  if (coachUserId) {
    const { data, error } = await supabase
      .from("facility_reservations" as any)
      .select("starts_at,ends_at,space_id,coach_user_id,status")
      .eq("coach_user_id", coachUserId)
      .neq("status", "cancelled")
      .lt("starts_at", rangeEnd.toISOString())
      .gt("ends_at", rangeStart.toISOString());
    if (error) throw error;
    coachRows = data ?? [];
  }

  const busy = [...(spaceRows ?? []), ...coachRows].map((r: any) => ({
    s: new Date(r.starts_at),
    e: new Date(r.ends_at),
  }));

  // 2) Walk each day, build candidate slots inside operating hours.
  const out: FreeSlot[] = [];
  const stepMs = slotStepMinutes * 60_000;
  const durationMs = durationMinutes * 60_000;

  for (let i = 0; i < daysAhead; i++) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() + i);
    const dow = day.getDay();
    const h = hours.find((x) => x.day_of_week === dow);
    if (!h || h.is_closed) continue;
    const open = parseHM(h.open_time);
    const close = parseHM(h.close_time);

    const dayOpen = new Date(day);
    dayOpen.setHours(open.h, open.m, 0, 0);
    const dayClose = new Date(day);
    dayClose.setHours(close.h, close.m, 0, 0);

    let cursor = new Date(Math.max(dayOpen.getTime(), now.getTime()));
    // round cursor up to next slot boundary
    const offset = cursor.getTime() % stepMs;
    if (offset !== 0) cursor = new Date(cursor.getTime() + (stepMs - offset));

    while (cursor.getTime() + durationMs <= dayClose.getTime()) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + durationMs);
      const conflict = busy.some((b) => overlaps(slotStart, slotEnd, b.s, b.e));
      if (!conflict) out.push({ start: slotStart, end: slotEnd });
      cursor = new Date(cursor.getTime() + stepMs);
    }
  }

  return out;
}
