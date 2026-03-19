import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { VaultRole, Permission, hasPermission, getPrimaryRole, getDashboardRoute } from "@/lib/permissions";

interface RoleAuthState {
  user: User | null;
  roles: VaultRole[];
  primaryRole: VaultRole | null;
  isLoading: boolean;
}

/**
 * Unified hook for role-based auth. Loads from user_roles + team_whitelist.
 * Replaces ad-hoc role checks scattered across useAdminAuth / useOwnerAuth.
 */
export const useRoleAuth = () => {
  const [state, setState] = useState<RoleAuthState>({
    user: null,
    roles: [],
    primaryRole: null,
    isLoading: true,
  });

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setState({ user: null, roles: [], primaryRole: null, isLoading: false });
          return;
        }

        // Fetch roles from user_roles table
        const { data: roleRows } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const roles: VaultRole[] = (roleRows || [])
          .map((r) => r.role as string)
          .filter((r): r is VaultRole =>
            ["owner", "admin", "coach", "athlete", "parent"].includes(r)
          );

        // Also check team_whitelist for owner/admin (parallel system)
        if (user.email) {
          const { data: tw } = await supabase
            .from("team_whitelist")
            .select("admin_access, full_access")
            .eq("email", user.email.toLowerCase())
            .maybeSingle();

          if (tw?.admin_access && tw?.full_access && !roles.includes("owner")) {
            roles.push("owner");
          }
          if (tw?.admin_access && !tw?.full_access && !roles.includes("admin")) {
            roles.push("admin");
          }
        }

        // Check coaches table for coach role (backward compat)
        const { data: coachData } = await supabase
          .from("coaches")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "Active")
          .maybeSingle();

        if (coachData && !roles.includes("coach")) {
          roles.push("coach");
        }

        setState({
          user,
          roles,
          primaryRole: getPrimaryRole(roles),
          isLoading: false,
        });
      } catch (error) {
        console.error("useRoleAuth error:", error);
        setState({ user: null, roles: [], primaryRole: null, isLoading: false });
      }
    };

    loadRoles();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadRoles();
    });

    return () => subscription.unsubscribe();
  }, []);

  const can = useCallback(
    (permission: Permission) => hasPermission(state.roles, permission),
    [state.roles]
  );

  const dashboardRoute = useMemo(
    () => getDashboardRoute(state.primaryRole),
    [state.primaryRole]
  );

  return {
    ...state,
    can,
    dashboardRoute,
    isOwner: state.roles.includes("owner"),
    isAdmin: state.roles.includes("admin") || state.roles.includes("owner"),
    isCoach: state.roles.includes("coach"),
    isAthlete: state.roles.includes("athlete"),
    isParent: state.roles.includes("parent"),
  };
};
