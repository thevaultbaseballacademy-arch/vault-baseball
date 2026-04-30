import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VaultRole, Permission, hasPermission, getPrimaryRole, getDashboardRoute } from "@/lib/permissions";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { withTimeout } from "@/lib/queryTimeout";

/**
 * Unified hook for role-based auth. Uses React Query for caching.
 * Each Supabase call is wrapped in a 4s timeout with a safe fallback so a
 * stalled REST call cannot trap the user on a global spinner.
 */
export const useRoleAuth = () => {
  const { user, isLoading: authLoading } = useSubscription();

  const { data, isLoading: rolesLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    retry: false,
    queryFn: async () => {
      if (!user) return { roles: [] as VaultRole[] };

      const [rolesResult, whitelistResult, coachResult] = await Promise.all([
        withTimeout(
          () => Promise.resolve(supabase.from("user_roles").select("role").eq("user_id", user.id)),
          4000,
          "user_roles lookup",
          { data: [] as { role: string }[] } as any,
        ),
        user.email
          ? withTimeout(
              () =>
                Promise.resolve(
                  supabase
                    .from("team_whitelist")
                    .select("admin_access, full_access")
                    .eq("email", user.email!.toLowerCase())
                    .maybeSingle(),
                ),
              4000,
              "team_whitelist lookup",
              { data: null } as any,
            )
          : Promise.resolve({ data: null } as any),
        withTimeout(
          () =>
            Promise.resolve(
              supabase
                .from("coaches")
                .select("id")
                .eq("user_id", user.id)
                .eq("status", "Active")
                .maybeSingle(),
            ),
          4000,
          "coaches lookup",
          { data: null } as any,
        ),
      ]);

      const roles: VaultRole[] = (rolesResult.data || [])
        .map((r) => r.role as string)
        .filter((r): r is VaultRole =>
          ["owner", "admin", "coach", "athlete", "parent"].includes(r)
        );

      const tw = whitelistResult.data;
      if (tw?.admin_access && tw?.full_access && !roles.includes("owner")) {
        roles.push("owner");
      }
      if (tw?.admin_access && !tw?.full_access && !roles.includes("admin")) {
        roles.push("admin");
      }

      if (coachResult.data && !roles.includes("coach")) {
        roles.push("coach");
      }

      return { roles };
    },
    enabled: !authLoading && !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const roles = data?.roles ?? [];
  const primaryRole = useMemo(() => getPrimaryRole(roles), [roles]);

  const can = useCallback(
    (permission: Permission) => hasPermission(roles, permission),
    [roles]
  );

  const dashboardRoute = useMemo(
    () => getDashboardRoute(primaryRole),
    [primaryRole]
  );

  return {
    user: user ?? null,
    roles,
    primaryRole,
    isLoading: authLoading || rolesLoading,
    can,
    dashboardRoute,
    isOwner: roles.includes("owner"),
    isAdmin: roles.includes("admin") || roles.includes("owner"),
    isCoach: roles.includes("coach"),
    isAthlete: roles.includes("athlete"),
    isParent: roles.includes("parent"),
  };
};
