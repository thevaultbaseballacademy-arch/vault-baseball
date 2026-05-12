import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Lightweight staff-access check for the Scheduling OS (`/ops/*`).
 * Returns whether the signed-in user is an admin/owner or coach.
 * Uses the existing user_roles table + is_owner() conventions.
 */
export interface StaffAccess {
  userId: string | null;
  isAdmin: boolean;
  isCoach: boolean;
  isStaff: boolean;
  isLoading: boolean;
}

export const useStaffAccess = (): StaffAccess => {
  const [state, setState] = useState<StaffAccess>({
    userId: null,
    isAdmin: false,
    isCoach: false,
    isStaff: false,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) setState({ userId: null, isAdmin: false, isCoach: false, isStaff: false, isLoading: false });
          return;
        }
        const [{ data: roles }, { data: ownerRow }] = await Promise.all([
          supabase.from("user_roles").select("role").eq("user_id", user.id),
          supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle(),
        ]);
        const isAdmin = !!roles?.some((r: any) => r.role === "admin") || !!ownerRow;
        const isCoach = !!roles?.some((r: any) => r.role === "coach");
        if (!cancelled) {
          setState({
            userId: user.id,
            isAdmin,
            isCoach,
            isStaff: isAdmin || isCoach,
            isLoading: false,
          });
        }
      } catch (e) {
        console.error("[useStaffAccess]", e);
        if (!cancelled) setState({ userId: null, isAdmin: false, isCoach: false, isStaff: false, isLoading: false });
      }
    };
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => check());
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return state;
};
