import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type FacilitySpace = {
  id: string;
  name: string;
  space_type: string;
  capacity: number;
  color: string;
  grid_x: number;
  grid_y: number;
  grid_w: number;
  grid_h: number;
  zone: string | null;
  notes: string | null;
  is_active: boolean;
  display_order: number;
  type_id: string | null;
};

export type FacilityHours = {
  id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
};

export type FacilitySettings = {
  id: string;
  min_booking_minutes: number;
  max_booking_minutes: number;
  advance_booking_days: number;
  slot_size_minutes: number;
  enforce_hours: boolean;
  enforce_max_length: boolean;
  enforce_advance_window: boolean;
};

export type FacilityReservation = {
  id: string;
  space_id: string;
  title: string;
  notes: string | null;
  starts_at: string;
  ends_at: string;
  attendee_count: number | null;
  reserved_for: string | null;
  color: string | null;
  status: string;
  created_by: string | null;
};

export const useFacilitySpaces = () => {
  return useQuery({
    queryKey: ["facility-spaces"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facility_spaces" as any)
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as FacilitySpace[];
    },
  });
};

export const useFacilityHours = () => {
  return useQuery({
    queryKey: ["facility-hours"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facility_hours" as any)
        .select("*")
        .order("day_of_week", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as FacilityHours[];
    },
  });
};

export const useFacilitySettings = () => {
  return useQuery({
    queryKey: ["facility-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facility_settings" as any)
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as FacilitySettings | null;
    },
  });
};

export const useFacilityReservations = (rangeStart: string, rangeEnd: string) => {
  return useQuery({
    queryKey: ["facility-reservations", rangeStart, rangeEnd],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facility_reservations" as any)
        .select("*")
        .gte("starts_at", rangeStart)
        .lte("starts_at", rangeEnd)
        .neq("status", "cancelled")
        .order("starts_at", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as FacilityReservation[];
    },
  });
};

export const useUpsertSpace = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (space: Partial<FacilitySpace> & { id?: string }) => {
      if (space.id) {
        const { error } = await supabase.from("facility_spaces" as any).update(space).eq("id", space.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("facility_spaces" as any).insert(space);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["facility-spaces"] });
      toast.success("Space saved");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useDeleteSpace = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("facility_spaces" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["facility-spaces"] });
      toast.success("Space deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useUpdateSpacePosition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      patch: { id: string; grid_x?: number; grid_y?: number; grid_w?: number; grid_h?: number },
    ) => {
      const { id, ...fields } = patch;
      const { error } = await supabase.from("facility_spaces" as any).update(fields).eq("id", id);
      if (error) throw error;
    },
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: ["facility-spaces"] });
      const prev = qc.getQueryData<FacilitySpace[]>(["facility-spaces"]);
      qc.setQueryData<FacilitySpace[]>(["facility-spaces"], (old) =>
        (old || []).map((s) => (s.id === patch.id ? { ...s, ...patch } : s)),
      );
      return { prev };
    },
    onError: (e: any, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["facility-spaces"], ctx.prev);
      toast.error(e.message);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["facility-spaces"] });
    },
  });
};

export const useUpdateHours = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (hours: FacilityHours) => {
      const { error } = await supabase
        .from("facility_hours" as any)
        .update({ open_time: hours.open_time, close_time: hours.close_time, is_closed: hours.is_closed })
        .eq("id", hours.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["facility-hours"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<FacilitySettings> & { id: string }) => {
      const { error } = await supabase.from("facility_settings" as any).update(settings).eq("id", settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["facility-settings"] });
      toast.success("Settings saved");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useUpsertReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: Partial<FacilityReservation> & { id?: string }) => {
      if (r.id) {
        const { error } = await supabase.from("facility_reservations" as any).update(r).eq("id", r.id);
        if (error) throw error;
      } else {
        const { data: u } = await supabase.auth.getUser();
        const { error } = await supabase
          .from("facility_reservations" as any)
          .insert({ ...r, created_by: u.user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["facility-reservations"] });
      toast.success("Reservation saved");
    },
    onError: (e: any) => toast.error(e.message),
  });
};

export const useDeleteReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("facility_reservations" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["facility-reservations"] });
      toast.success("Reservation deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });
};
