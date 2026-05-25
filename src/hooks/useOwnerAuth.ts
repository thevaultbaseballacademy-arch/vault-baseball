import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { withTimeout } from "@/lib/queryTimeout";

interface OwnerAuthState {
  user: User | null;
  isOwner: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  profile: {
    id: string;
    display_name: string;
    email: string;
  } | null;
}

export const useOwnerAuth = () => {
  const { user, isOwner, isAdmin, isLoading: roleLoading } = useRoleAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["owner-profile", user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (!user) return null;

      const result = await withTimeout(
        () => Promise.resolve(
          supabase
            .from("profiles")
            .select("user_id, display_name, email")
            .eq("user_id", user.id)
            .maybeSingle(),
        ),
        4000,
        "owner profile lookup",
        { data: null } as any,
      );

      const profileData = result.data;
      return profileData ? {
        id: profileData.user_id,
        display_name: profileData.display_name || "Owner",
        email: profileData.email || user.email || "",
      } : null;
    },
  });

  return useMemo<OwnerAuthState>(() => ({
    user: user as User | null,
    isOwner,
    isAdmin,
    isLoading: roleLoading || (!!user && profileLoading),
    profile: profile ?? null,
  }), [isAdmin, isOwner, profile, profileLoading, roleLoading, user]);
};
