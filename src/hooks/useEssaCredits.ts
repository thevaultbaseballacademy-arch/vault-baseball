import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type EssaCredit = {
  id: string;
  total_lessons: number;
  used_lessons: number;
  remaining: number;
  expires_at: string | null;
  source: string;
  purchased_at: string;
};

export type EssaBooking = {
  id: string;
  title: string;
  notes: string | null;
  starts_at: string;
  ends_at: string;
  status: string;
  space_id: string;
};

/** Active (not exhausted, not expired) lesson credits for the current user. */
export const useEssaCredits = () => {
  return useQuery({
    queryKey: ["essa-credits"],
    queryFn: async (): Promise<EssaCredit[]> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data, error } = await supabase
        .from("lesson_credits")
        .select("id,total_lessons,used_lessons,expires_at,source,purchased_at")
        .eq("user_id", u.user.id)
        .order("purchased_at", { ascending: true });
      if (error) throw error;
      return (data ?? [])
        .map((c: any) => ({ ...c, remaining: c.total_lessons - c.used_lessons }))
        .filter(
          (c: any) =>
            c.remaining > 0 && (!c.expires_at || new Date(c.expires_at) > new Date()),
        );
    },
  });
};

/** Current user's upcoming + recent ESSA bookings. */
export const useMyEssaBookings = () => {
  return useQuery({
    queryKey: ["my-essa-bookings"],
    queryFn: async (): Promise<EssaBooking[]> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return [];
      const { data, error } = await supabase
        .from("facility_reservations" as any)
        .select("id,title,notes,starts_at,ends_at,status,space_id")
        .eq("created_by", u.user.id)
        .neq("status", "cancelled")
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as EssaBooking[];
    },
  });
};

/**
 * Book an ESSA lesson using an existing credit (no Stripe).
 * Picks the oldest credit with remaining lessons. The DB trigger
 * `auto_consume_booking_credit` does NOT fire here (it's keyed off
 * remote_lessons), so we decrement manually.
 */
export const useBookWithCredit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      lessonId: string;
      lessonName: string;
      durationMinutes: number;
      slot: Date;
    }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Please sign in to book.");

      // Pick the first eligible space
      const { data: spaces, error: spaceErr } = await supabase
        .from("facility_spaces" as any)
        .select("id,name,color")
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .limit(1);
      if (spaceErr) throw spaceErr;
      const space: any = spaces?.[0];
      if (!space) throw new Error("No facility spaces are configured.");

      // Pick the oldest credit
      const { data: credits, error: credErr } = await supabase
        .from("lesson_credits")
        .select("id,total_lessons,used_lessons,expires_at")
        .eq("user_id", u.user.id)
        .order("purchased_at", { ascending: true });
      if (credErr) throw credErr;
      const credit = (credits ?? []).find(
        (c: any) =>
          c.total_lessons - c.used_lessons > 0 &&
          (!c.expires_at || new Date(c.expires_at) > new Date()),
      );
      if (!credit) throw new Error("No active lesson credits available.");

      const ends = new Date(args.slot.getTime() + args.durationMinutes * 60_000);

      // 1) Create reservation tagged ESSA so RLS allows the insert
      const { data: res, error: resErr } = await supabase
        .from("facility_reservations" as any)
        .insert({
          space_id: space.id,
          title: `ESSA · ${args.lessonName}`,
          notes: `ESSA:${args.lessonId}`,
          starts_at: args.slot.toISOString(),
          ends_at: ends.toISOString(),
          attendee_count: 1,
          status: "confirmed",
          created_by: u.user.id,
          color: space.color,
        })
        .select("id")
        .single();
      if (resErr) throw resErr;

      // 2) Decrement the credit + log usage
      const { error: updErr } = await supabase
        .from("lesson_credits")
        .update({
          used_lessons: (credit as any).used_lessons + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq("id", (credit as any).id);
      if (updErr) throw updErr;

      await supabase.from("lesson_credit_usage").insert({
        credit_id: (credit as any).id,
        user_id: u.user.id,
        lesson_id: (res as any).id,
        lesson_type: "essa_facility",
      });

      return { reservationId: (res as any).id };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["essa-credits"] });
      qc.invalidateQueries({ queryKey: ["my-essa-bookings"] });
      qc.invalidateQueries({ queryKey: ["facility-reservations"] });
      toast.success("Booked! Your credit was applied.");
    },
    onError: (e: any) => toast.error(e.message ?? "Could not book this slot."),
  });
};
