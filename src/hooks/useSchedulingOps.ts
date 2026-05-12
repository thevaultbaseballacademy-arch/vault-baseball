import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SchedulingBooking = {
  space_id: string;
  coach_user_id?: string | null;
  client_user_id?: string | null;
  title: string;
  notes?: string | null;
  internal_notes?: string | null;
  starts_at: string;
  ends_at: string;
  buffer_before_min?: number;
  buffer_after_min?: number;
  booking_type?:
    | "in_person_lesson"
    | "remote_lesson"
    | "evaluation"
    | "personal_training"
    | "facility_reservation"
    | "blackout";
  attendee_count?: number;
  reserved_for?: string | null;
  color?: string | null;
};

type MutateResult<T = any> = { ok: true; reservation: T } | { ok: false; error: string; conflicts?: any[] };

const callFn = async (body: any) => {
  const { data, error } = await supabase.functions.invoke("scheduling-mutate", { body });
  if (error) {
    // Edge function returned non-2xx → context.error.message is generic. Try to read context.
    const ctxBody = (error as any)?.context?.body ?? data;
    const errMsg = ctxBody?.error ?? error.message ?? "Scheduling failed";
    return { ok: false, error: typeof errMsg === "string" ? errMsg : "conflict", conflicts: ctxBody?.conflicts } as MutateResult;
  }
  if (data?.error) return { ok: false, error: String(data.error), conflicts: data.conflicts } as MutateResult;
  return { ok: true, reservation: data.reservation } as MutateResult;
};

export const useSchedulingOps = () => {
  const [pending, setPending] = useState(false);

  const create = useCallback(async (data: SchedulingBooking) => {
    setPending(true);
    const res = await callFn({ action: "create", data });
    setPending(false);
    if (!res.ok) {
      toast.error(res.error === "conflict" ? "Time conflict — pick another slot." : res.error);
    } else {
      toast.success("Booking created");
    }
    return res;
  }, []);

  const update = useCallback(async (reservation_id: string, data: Partial<SchedulingBooking>) => {
    setPending(true);
    const res = await callFn({ action: "update", reservation_id, data });
    setPending(false);
    if (!res.ok) {
      toast.error(res.error === "conflict" ? "Time conflict — pick another slot." : res.error);
    } else {
      toast.success("Booking updated");
    }
    return res;
  }, []);

  const cancel = useCallback(async (reservation_id: string, reason?: string) => {
    setPending(true);
    const res = await callFn({ action: "cancel", reservation_id, reason });
    setPending(false);
    if (!res.ok) toast.error(res.error);
    else toast.success("Booking cancelled");
    return res;
  }, []);

  return { pending, create, update, cancel };
};
