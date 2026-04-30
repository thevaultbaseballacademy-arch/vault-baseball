import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PUBLIC_QUERY_TIMEOUT_MS = 6000;

const runWithTimeout = async <T,>(
  label: string,
  queryFactory: (signal: AbortSignal) => Promise<T>,
  timeoutMs = PUBLIC_QUERY_TIMEOUT_MS,
) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(`${label} timed out`), timeoutMs);

  try {
    return await queryFactory(controller.signal);
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(`${label} is taking too long. Please try again.`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export type TryoutAgeGroup = "9-12" | "13-17";
export type TryoutStatus = "draft" | "published" | "closed";

export interface TryoutEvent {
  id: string;
  name: string;
  age_group: TryoutAgeGroup;
  starts_at: string;
  ends_at: string | null;
  location_name: string;
  address: string | null;
  price_cents: number;
  capacity: number;
  waitlist_capacity: number;
  description: string | null;
  what_to_bring: string | null;
  waiver_text: string;
  status: TryoutStatus;
  coach_ids: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface TryoutRegistration {
  id: string;
  event_id: string;
  player_first_name: string;
  player_last_name: string;
  player_dob: string;
  player_throwing_hand: string | null;
  player_position: string | null;
  player_current_team: string | null;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_relationship: string;
  medical_notes: string | null;
  photo_release_consent: boolean;
  waiver_signature_name: string;
  waiver_signed_at: string;
  status: "pending" | "confirmed" | "waitlisted" | "cancelled";
  registered_at: string;
  paid_at: string | null;
}

/** Public list of upcoming published tryouts. */
export const usePublicTryouts = () =>
  useQuery({
    queryKey: ["tryouts", "public"],
    queryFn: async () => {
      const { data, error } = await runWithTimeout("Loading tryouts", (signal) =>
        supabase
          .from("tryout_events")
          .select("id, name, age_group, starts_at, ends_at, location_name, address, price_cents, capacity, waitlist_capacity, description, what_to_bring, waiver_text, status, coach_ids, created_at, updated_at")
          .eq("status", "published")
          .gt("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true })
          .abortSignal(signal)
      );
      if (error) throw error;
      return (data ?? []) as TryoutEvent[];
    },
  });

/** Public single-event lookup (only returns if published + future). */
export const usePublicTryout = (id?: string) =>
  useQuery({
    queryKey: ["tryouts", "public", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await runWithTimeout("Loading registration form", (signal) =>
        supabase
          .from("tryout_events")
          .select("id, name, age_group, starts_at, ends_at, location_name, address, price_cents, capacity, waitlist_capacity, description, what_to_bring, waiver_text, status, coach_ids, created_at, updated_at")
          .eq("id", id!)
          .eq("status", "published")
          .gt("starts_at", new Date().toISOString())
          .maybeSingle()
          .abortSignal(signal)
      );
      if (error) throw error;
      return data as TryoutEvent | null;
    },
  });

/** Confirmed/pending count, for showing "spots remaining" publicly. */
export const useTryoutCounts = (id?: string) =>
  useQuery({
    queryKey: ["tryouts", "counts", id],
    enabled: !!id,
    queryFn: async () => {
      const [{ count: filled }, { count: waitlisted }] = await Promise.all([
        runWithTimeout("Loading tryout counts", (signal) =>
          supabase
            .from("tryout_registrations")
            .select("id", { count: "exact", head: true })
            .eq("event_id", id!)
            .in("status", ["confirmed", "pending"])
            .abortSignal(signal)
        ),
        runWithTimeout("Loading waitlist counts", (signal) =>
          supabase
            .from("tryout_registrations")
            .select("id", { count: "exact", head: true })
            .eq("event_id", id!)
            .eq("status", "waitlisted")
            .abortSignal(signal)
        ),
      ]);
      return { filled: filled ?? 0, waitlisted: waitlisted ?? 0 };
    },
  });

// ─── Admin ──────────────────────────────────────────────────────────────

export const useAdminTryouts = () =>
  useQuery({
    queryKey: ["tryouts", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tryout_events")
        .select("*")
        .order("starts_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TryoutEvent[];
    },
  });

export const useAdminTryout = (id?: string) =>
  useQuery({
    queryKey: ["tryouts", "admin", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tryout_events")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as TryoutEvent;
    },
  });

export const useTryoutRegistrations = (eventId?: string) =>
  useQuery({
    queryKey: ["tryouts", "registrations", eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tryout_registrations")
        .select("*")
        .eq("event_id", eventId!)
        .order("registered_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TryoutRegistration[];
    },
  });

export const useSaveTryout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<TryoutEvent> & { id?: string }) => {
      const { id, ...payload } = input;
      if (id) {
        const { data, error } = await supabase
          .from("tryout_events")
          .update(payload)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("tryout_events")
        .insert({ ...payload, created_by: user?.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tryouts"] });
      toast.success("Tryout saved");
    },
    onError: (e: any) => toast.error(e?.message || "Could not save tryout"),
  });
};

export const useDeleteTryout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tryout_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tryouts"] });
      toast.success("Tryout deleted");
    },
    onError: (e: any) => toast.error(e?.message || "Could not delete tryout"),
  });
};

export const useUpdateRegistrationStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TryoutRegistration["status"] }) => {
      const { error } = await supabase
        .from("tryout_registrations")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tryouts", "registrations"] });
      qc.invalidateQueries({ queryKey: ["tryouts", "counts"] });
      toast.success("Registration updated");
    },
    onError: (e: any) => toast.error(e?.message || "Could not update registration"),
  });
};

export const submitTryoutRegistration = async (payload: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("register-for-tryout", {
    body: payload,
  });
  if (error) throw new Error(error.message || "Registration failed");
  if (data?.error) throw new Error(data.error);
  return data as { success: true; registration_id: string; status: string; waitlist_position: number | null };
};
