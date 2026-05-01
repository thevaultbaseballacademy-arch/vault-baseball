import { useEffect, useState } from "react";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { isGloballyReconnecting } from "@/hooks/useAuth";

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
  const location = useLocation();

  const [forceShow, setForceShow] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => setForceShow(true), 3000);
    return () => window.clearTimeout(t);
  }, [loading]);

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

  if (loading && !forceShow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isFullMember) return <>{children}</>;
  if (isTrialUser && !isTrialExpired) return <>{children}</>;
  if (isTrialUser && isTrialExpired && !allowTrialAccess) {
    return <Navigate to="/trial-expired" replace />;
  }

  return <>{children}</>;
};

export default TrialProtectedRoute;
