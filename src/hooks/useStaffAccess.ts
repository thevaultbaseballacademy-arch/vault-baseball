import { useMemo } from "react";
import { useRoleAuth } from "@/hooks/useRoleAuth";

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
  const { user, isAdmin, isCoach, isLoading } = useRoleAuth();

  return useMemo(
    () => ({
      userId: user?.id ?? null,
      isAdmin,
      isCoach,
      isStaff: isAdmin || isCoach,
      isLoading,
    }),
    [isAdmin, isCoach, isLoading, user?.id],
  );
};
