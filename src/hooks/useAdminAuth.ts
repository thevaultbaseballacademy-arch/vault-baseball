import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { withTimeout } from "@/lib/queryTimeout";

interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  coachProfile: {
    id: string;
    org_id: string;
    role: string;
    name: string;
  } | null;
}

export const useAdminAuth = () => {
  const { user, isAdmin, isLoading: roleLoading } = useRoleAuth();

  const { data: coachProfile, isLoading: coachProfileLoading } = useQuery({
    queryKey: ["admin-coach-profile", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!user) return null;

      const result = await withTimeout(
        () => Promise.resolve(
          supabase
            .from("coaches")
            .select("id, org_id, role, name")
            .eq("user_id", user.id)
            .eq("status", "Active")
            .maybeSingle(),
        ),
        4000,
        "admin coach profile lookup",
        { data: null } as any,
      );

      return (result.data ?? null) as AdminAuthState["coachProfile"];
    },
  });

  return useMemo<AdminAuthState>(() => ({
    user: user as User | null,
    isAdmin,
    isLoading: roleLoading || (!!user && coachProfileLoading),
    coachProfile: coachProfile ?? null,
  }), [coachProfile, coachProfileLoading, isAdmin, roleLoading, user]);
};
