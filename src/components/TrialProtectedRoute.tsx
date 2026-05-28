import { useEffect, useState } from "react";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { isGloballyReconnecting } from "@/hooks/useAuth";
import { useRoleAuth } from "@/hooks/useRoleAuth";

interface TrialProtectedRouteProps {
  children: React.ReactNode;
  allowTrialAccess?: boolean; // Some pages (like velocity-baseline) allow trial users
}

/**
 * Trial gate. Hard ceiling on the loading spinner so a slow trial-status
 * query can never trap users on a blank page after sign-in. After 3s we
 * fail-open: we let the user through. The dashboard already renders gracefully
 * for non-trial / non-subscribed users.
 */
const TrialProtectedRoute = ({
  children,
  allowTrialAccess = false,
}: TrialProtectedRouteProps) => {
  const { user, isLoading: authLoading } = useSubscription();
  const { isTrialUser, isTrialExpired, isFullMember, loading } = useTrialStatus();
  const { isCoach, isAdmin, isOwner, isLoading: roleLoading } = useRoleAuth();
  const location = useLocation();

  const [forceShow, setForceShow] = useState(false);
  useEffect(() => {
    if (!loading && !roleLoading) return;
    const t = window.setTimeout(() => setForceShow(true), 3000);
    return () => window.clearTimeout(t);
  }, [loading, roleLoading]);

  // Wait for auth to hydrate before deciding to bounce to /auth.
  if (authLoading && !forceShow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Don't bounce while a session refresh is in flight (iOS BFCache, tab restore).
    if (isGloballyReconnecting()) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // CRITICAL: wait for role lookup to settle before any trial-expired redirect,
  // otherwise admins/coaches/owners get bounced to /trial-expired on first paint.
  if ((loading || roleLoading) && !forceShow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Coaches, admins, and owners bypass the trial gate entirely.
  if (isCoach || isAdmin || isOwner) return <>{children}</>;
  if (isFullMember) return <>{children}</>;
  if (isTrialUser && !isTrialExpired) return <>{children}</>;
  if (isTrialUser && isTrialExpired && !allowTrialAccess) {
    return <Navigate to="/trial-expired" replace />;
  }

  return <>{children}</>;
};


export default TrialProtectedRoute;
