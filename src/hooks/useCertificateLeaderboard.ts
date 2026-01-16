import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  certificate_count: number;
  latest_certificate_date: string;
  courses_completed: string[];
}

export const useCertificateLeaderboard = (limit: number = 50) => {
  return useQuery({
    queryKey: ["certificate-leaderboard", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("get_certificate_leaderboard", { result_limit: limit });
      
      if (error) throw error;
      return (data || []) as LeaderboardEntry[];
    },
  });
};
