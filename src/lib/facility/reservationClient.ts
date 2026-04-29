import { supabase } from "@/integrations/supabase/client";

/**
 * Workstream 3 — Multi-resource booking client
 *
 * All writes go through `create_reservation_atomic` (Postgres RPC with
 * `FOR UPDATE` lock) so conflicts are caught at the database, never at the
 * realtime cache layer.
 *
 * Phase 2 conflict-checks SPACES + COACHES only. Equipment is off-the-shelf
 * (see mem://features/facility/equipment-resource-model).
 */

export type ReservationConflict = {
  resource_type: "space" | "coach" | "equipment";
  resource_id: string;
  conflicting_reservation_id: string;
  conflicting_starts_at: string;
  conflicting_ends_at: string;
  conflicting_title: string | null;
};

export type CreateReservationResult =
  | { success: true; reservation_id: string }
  | { success: false; error: "conflict"; conflicts: ReservationConflict[] };

export type CreateReservationInput = {
  spaceId: string;
  coachUserId?: string | null;
  startsAt: Date;
  endsAt: Date;
  title: string;
  email?: string | null;
  notes?: string | null;
  status?: "confirmed" | "pending" | "tentative";
};

export async function createReservationAtomic(
  input: CreateReservationInput
): Promise<CreateReservationResult> {
  const { data, error } = await supabase.rpc("create_reservation_atomic", {
    p_space_id: input.spaceId,
    p_coach_user_id: input.coachUserId ?? null,
    p_starts_at: input.startsAt.toISOString(),
    p_ends_at: input.endsAt.toISOString(),
    p_title: input.title,
    p_email: input.email ?? null,
    p_notes: input.notes ?? null,
    p_status: input.status ?? "confirmed",
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as CreateReservationResult;
}

export type RecurringPreviewInput = {
  spaceId: string;
  coachUserId?: string | null;
  startsAt: Date;
  endsAt: Date;
  /** RRULE string. Phase 2 ignores this — single occurrence only. */
  recurrenceRule?: string | null;
  /** Series end. Phase 2 ignores this. */
  seriesEndDate?: Date | null;
};

export type RecurringPreviewResult = {
  occurrences_checked: number;
  total_conflicts: number;
  conflicts: Array<{
    occurrence_starts_at: string;
    resource_type: "space" | "coach" | "equipment";
    resource_id: string;
    conflicting_reservation_id: string;
  }>;
};

export async function previewRecurringConflicts(
  input: RecurringPreviewInput
): Promise<RecurringPreviewResult> {
  const { data, error } = await supabase.rpc("preview_recurring_conflicts", {
    p_space_id: input.spaceId,
    p_coach_user_id: input.coachUserId ?? null,
    p_starts_at: input.startsAt.toISOString(),
    p_ends_at: input.endsAt.toISOString(),
    p_recurrence_rule: input.recurrenceRule ?? null,
    p_series_end_date: input.seriesEndDate
      ? input.seriesEndDate.toISOString().slice(0, 10)
      : null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as RecurringPreviewResult;
}
