import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess } from "@/hooks/useStaffAccess";

/**
 * StaffGuard — gates routes to admins/owners + coaches only (Scheduling OS).
 * Falls back to /auth for unauthenticated users and /dashboard for clients.
 */
export const StaffGuard = ({ children }: { children: React.ReactNode }) => {
  const { state } = useAuth();
  const { isStaff, isLoading } = useStaffAccess();
  const location = useLocation();

  if (state === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (state === "unauthenticated") {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isStaff) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default StaffGuard;
