import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AdminEssaBooking = {
  id: string;
  title: string;
  notes: string | null;
  starts_at: string;
  ends_at: string;
  status: string;
  space_id: string;
  created_by: string | null;
  coach_user_id: string | null;
  attendee_count: number | null;
  athlete_name?: string | null;
  athlete_email?: string | null;
  coach_name?: string | null;
};

export type EssaBookingFilters = {
  status?: "all" | "confirmed" | "cancelled" | "completed";
  range?: "upcoming" | "past" | "today" | "all";
  search?: string;
};

/** All ESSA-tagged bookings across the facility (admin view). */
export const useAdminEssaBookings = (filters: EssaBookingFilters = {}) => {
  return useQuery({
    queryKey: ["admin-essa-bookings", filters],
    queryFn: async (): Promise<AdminEssaBooking[]> => {
      let q = supabase
        .from("facility_reservations" as any)
        .select("id,title,notes,starts_at,ends_at,status,space_id,created_by,coach_user_id,attendee_count")
        .like("notes", "ESSA:%")
        .order("starts_at", { ascending: false })
        .limit(500);

      if (filters.status && filters.status !== "all") q = q.eq("status", filters.status);

      const now = new Date().toISOString();
      if (filters.range === "upcoming") q = q.gte("starts_at", now);
      else if (filters.range === "past") q = q.lt("starts_at", now);
      else if (filters.range === "today") {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        q = q.gte("starts_at", start.toISOString()).lte("starts_at", end.toISOString());
      }

      const { data, error } = await q;
      if (error) throw error;
      const rows = (data ?? []) as any[];

      // Hydrate athlete + coach display names
      const userIds = Array.from(
        new Set(
          rows
            .flatMap((r) => [r.created_by, r.coach_user_id])
            .filter(Boolean) as string[],
        ),
      );
      let profileMap: Record<string, { name: string | null; email: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id,display_name,email")
          .in("user_id", userIds);
        profileMap = Object.fromEntries(
          (profs ?? []).map((p: any) => [p.user_id, { name: p.display_name, email: p.email }]),
        );
      }

      let hydrated = rows.map((r) => ({
        ...r,
        athlete_name: r.created_by ? profileMap[r.created_by]?.name ?? null : null,
        athlete_email: r.created_by ? profileMap[r.created_by]?.email ?? null : null,
        coach_name: r.coach_user_id ? profileMap[r.coach_user_id]?.name ?? null : null,
      })) as AdminEssaBooking[];

      if (filters.search?.trim()) {
        const s = filters.search.trim().toLowerCase();
        hydrated = hydrated.filter(
          (r) =>
            r.title.toLowerCase().includes(s) ||
            r.athlete_name?.toLowerCase().includes(s) ||
            r.athlete_email?.toLowerCase().includes(s),
        );
      }

      return hydrated;
    },
  });
};

/** Cancel an ESSA reservation. */
export const useCancelEssaBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("facility_reservations" as any)
        .update({ status: "cancelled" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-essa-bookings"] });
      qc.invalidateQueries({ queryKey: ["facility-reservations"] });
      toast.success("Booking cancelled");
    },
    onError: (e: any) => toast.error(e.message ?? "Could not cancel"),
  });
};

/** Reschedule an ESSA reservation while preserving its duration. */
export const useRescheduleEssaBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; newStart: Date; durationMinutes: number }) => {
      const ends = new Date(args.newStart.getTime() + args.durationMinutes * 60_000);
      const { error } = await supabase
        .from("facility_reservations" as any)
        .update({
          starts_at: args.newStart.toISOString(),
          ends_at: ends.toISOString(),
        })
        .eq("id", args.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-essa-bookings"] });
      qc.invalidateQueries({ queryKey: ["facility-reservations"] });
      toast.success("Booking rescheduled");
    },
    onError: (e: any) => toast.error(e.message ?? "Could not reschedule"),
  });
};

/** Manually grant ESSA lesson credits to a user (by email). */
export const useGrantEssaCredits = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      email: string;
      totalLessons: number;
      reason?: string;
      expiresInDays?: number | null;
    }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");

      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("user_id,email,display_name")
        .ilike("email", args.email.trim())
        .maybeSingle();
      if (profErr) throw profErr;
      if (!prof) throw new Error(`No user found with email ${args.email}`);

      const expires_at =
        args.expiresInDays && args.expiresInDays > 0
          ? new Date(Date.now() + args.expiresInDays * 86_400_000).toISOString()
          : null;

      const { error } = await supabase.from("lesson_credits").insert({
        user_id: prof.user_id,
        total_lessons: args.totalLessons,
        used_lessons: 0,
        credit_type: "comp",
        source: "essa_admin_grant",
        granted_by: u.user.id,
        granted_reason: args.reason ?? null,
        expires_at,
      });
      if (error) throw error;

      return { recipient: prof.display_name ?? prof.email };
    },
    onSuccess: ({ recipient }) => {
      qc.invalidateQueries({ queryKey: ["essa-credits"] });
      toast.success(`Granted credits to ${recipient}`);
    },
    onError: (e: any) => toast.error(e.message ?? "Could not grant credits"),
  });
};
