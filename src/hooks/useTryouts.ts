import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TRYOUT_SUMMARY_SELECT = "id, name, age_group, starts_at, ends_at, location_name, address, price_cents, capacity, waitlist_capacity, description, what_to_bring, status, created_at, updated_at";
const TRYOUT_DETAIL_SELECT = `${TRYOUT_SUMMARY_SELECT}, waiver_text, coach_ids`;
const PUBLIC_TRYOUTS_CACHE_KEY = "public-tryouts:v2";
const PUBLIC_TRYOUT_CACHE_KEY = (id: string) => `public-tryout:${id}:v2`;

const isBrowser = typeof window !== "undefined";

const readCache = <T,>(key: string) => {
  if (!isBrowser) return undefined;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
};

const writeCache = <T,>(key: string, value: T) => {
  if (!isBrowser) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota / private mode failures.
  }
};

const isUpcomingPublishedTryout = ({ starts_at, status }: { starts_at: string; status: string }) =>
  status === "published" && new Date(starts_at).getTime() > Date.now();

const sortByStartDate = <T extends { starts_at: string }>(events: T[]) =>
  [...events].sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

export type TryoutAgeGroup = "9-12" | "13-17";
export type TryoutStatus = "draft" | "published" | "closed";

export interface TryoutEventSummary {
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
  status: TryoutStatus;
  created_at: string;
  updated_at: string;
}

export interface TryoutEvent extends TryoutEventSummary {
  waiver_text: string;
  coach_ids: string[] | null;
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
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    refetchOnReconnect: true,
    initialData: () => {
      const cached = readCache<TryoutEventSummary[]>(PUBLIC_TRYOUTS_CACHE_KEY);
      return cached ? sortByStartDate(cached.filter(isUpcomingPublishedTryout)) : undefined;
    },
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("tryout_events")
          .select(TRYOUT_SUMMARY_SELECT)
          .eq("status", "published")
          .gt("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true })
          .returns<TryoutEventSummary[]>();

        if (error) throw error;

        const events = sortByStartDate((data ?? []).filter(isUpcomingPublishedTryout));
        writeCache(PUBLIC_TRYOUTS_CACHE_KEY, events);
        return events;
      } catch (error) {
        const cached = readCache<TryoutEventSummary[]>(PUBLIC_TRYOUTS_CACHE_KEY);
        if (cached?.length) {
          return sortByStartDate(cached.filter(isUpcomingPublishedTryout));
        }

        throw error;
      }
    },
  });

/** Public single-event lookup (only returns if published + future). */
export const usePublicTryout = (id?: string) =>
  useQuery({
    queryKey: ["tryouts", "public", id],
    enabled: !!id,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
    refetchOnReconnect: true,
    initialData: () => (id ? readCache<TryoutEvent | null>(PUBLIC_TRYOUT_CACHE_KEY(id)) : undefined),
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("tryout_events")
          .select(TRYOUT_DETAIL_SELECT)
          .eq("id", id!)
          .eq("status", "published")
          .gt("starts_at", new Date().toISOString())
          .maybeSingle()
          .returns<TryoutEvent | null>();

        if (error) throw error;
        if (data) {
          writeCache(PUBLIC_TRYOUT_CACHE_KEY(id!), data);
        }

        return data as TryoutEvent | null;
      } catch (error) {
        const cached = id ? readCache<TryoutEvent | null>(PUBLIC_TRYOUT_CACHE_KEY(id)) : undefined;
        if (cached && isUpcomingPublishedTryout(cached)) {
          return cached;
        }

        throw error;
      }
    },
  });

/** Confirmed/pending count, for showing "spots remaining" publicly. */
export const useTryoutCounts = (id?: string) =>
  useQuery({
    queryKey: ["tryouts", "counts", id],
    enabled: !!id,
    retry: 1,
    refetchOnReconnect: true,
    queryFn: async () => {
      const [filledResponse, waitlistedResponse] = await Promise.all([
        supabase
          .from("tryout_registrations")
          .select("id", { count: "exact", head: true })
          .eq("event_id", id!)
          .in("status", ["confirmed", "pending"]),
        supabase
          .from("tryout_registrations")
          .select("id", { count: "exact", head: true })
          .eq("event_id", id!)
          .eq("status", "waitlisted"),
      ]);

      if (filledResponse.error) throw filledResponse.error;
      if (waitlistedResponse.error) throw waitlistedResponse.error;

      return {
        filled: filledResponse.count ?? 0,
        waitlisted: waitlistedResponse.count ?? 0,
      };
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
  try {
    const { data, error } = await supabase.functions.invoke("register-for-tryout", {
      body: payload,
    });

    if (error) throw new Error(error.message || "Registration failed");
    if (data?.error) throw new Error(data.error);

    return data as {
      success: true;
      registration_id: string;
      status: string;
      waitlist_position: number | null;
      duplicate?: boolean;
    };
  } catch (error: any) {
    throw new Error(error?.message || "Registration failed");
  }
};
