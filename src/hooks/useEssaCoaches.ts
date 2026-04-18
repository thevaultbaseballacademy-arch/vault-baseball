import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type EssaCoach = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  position: string | null;
};

/** All coaches available to be picked when booking an ESSA lesson. */
export const useEssaCoaches = () => {
  return useQuery({
    queryKey: ["essa-coaches"],
    queryFn: async (): Promise<EssaCoach[]> => {
      const { data: roleRows, error: roleErr } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "coach");
      if (roleErr) throw roleErr;
      const ids = Array.from(new Set((roleRows ?? []).map((r: any) => r.user_id)));
      if (ids.length === 0) return [];

      const { data: profs, error: profErr } = await supabase
        .from("profiles")
        .select("user_id,display_name,avatar_url,position")
        .in("user_id", ids);
      if (profErr) throw profErr;

      return (profs ?? [])
        .filter((p: any) => p.display_name)
        .map((p: any) => ({
          user_id: p.user_id,
          display_name: p.display_name,
          avatar_url: p.avatar_url ?? null,
          position: p.position ?? null,
        }))
        .sort((a, b) => a.display_name.localeCompare(b.display_name));
    },
  });
};

export type CoachSlot = { slot_start: string; slot_end: string };

/** Available ESSA slots for a coach on a given local date. */
export const useCoachEssaSlots = (
  coachUserId: string | null,
  date: Date | null,
  durationMinutes = 30,
) => {
  return useQuery({
    queryKey: ["coach-essa-slots", coachUserId, date?.toDateString(), durationMinutes],
    enabled: !!coachUserId && !!date,
    queryFn: async (): Promise<CoachSlot[]> => {
      if (!coachUserId || !date) return [];
      const iso = date.toISOString().slice(0, 10);
      const { data, error } = await supabase.rpc("get_coach_essa_availability" as any, {
        p_coach_user_id: coachUserId,
        p_date: iso,
        p_duration_minutes: durationMinutes,
      });
      if (error) throw error;
      return (data ?? []) as CoachSlot[];
    },
  });
};

/** Today's ESSA bookings for the signed-in coach. */
export const useCoachTodayEssa = () => {
  return useQuery({
    queryKey: ["coach-today-essa"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("facility_reservations" as any)
        .select("id,title,notes,starts_at,ends_at,status,space_id,created_by")
        .eq("coach_user_id", u.user.id)
        .gte("starts_at", start.toISOString())
        .lte("starts_at", end.toISOString())
        .neq("status", "cancelled")
        .order("starts_at", { ascending: true });
      if (error) throw error;

      const rows = (data ?? []) as any[];
      const ids = Array.from(new Set(rows.map((r) => r.created_by).filter(Boolean)));
      let nameMap: Record<string, string> = {};
      if (ids.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("user_id,display_name")
          .in("user_id", ids as string[]);
        nameMap = Object.fromEntries(
          (profs ?? []).map((p: any) => [p.user_id, p.display_name ?? "Athlete"]),
        );
      }
      return rows.map((r) => ({
        ...r,
        athlete_name: r.created_by ? nameMap[r.created_by] ?? null : null,
      }));
    },
  });
};
