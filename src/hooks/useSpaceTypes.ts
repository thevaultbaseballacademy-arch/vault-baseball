import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SpaceType = {
  id: string;
  key: string;
  name: string;
  icon: string;
  color: string;
  default_capacity: number;
  default_duration_minutes: number;
  allows_pitching_machine: boolean;
  coach_required: "yes" | "no" | "optional";
  is_custom: boolean;
  display_order: number;
};

export const useSpaceTypes = () => {
  return useQuery({
    queryKey: ["space-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("space_types" as any)
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as SpaceType[];
    },
    staleTime: 10 * 60 * 1000, // rarely changes
  });
};
