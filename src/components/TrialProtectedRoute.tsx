import { useTrialStatus } from "@/hooks/useTrialStatus";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface TrialProtectedRouteProps {
  children: React.ReactNode;
  allowTrialAccess?: boolean; // Some pages (like velocity-baseline) allow trial users
}

const TrialProtectedRoute = ({ 
  children, 
  allowTrialAccess = false 
}: TrialProtectedRouteProps) => {
  const { user } = useSubscription();
  const { isTrialUser, isTrialExpired, isFullMember, loading } = useTrialStatus();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (isFullMember) {
    return <>{children}</>;
  }

  if (isTrialUser && !isTrialExpired) {
    return <>{children}</>;
  }

  if (isTrialUser && isTrialExpired && !allowTrialAccess) {
    return <Navigate to="/trial-expired" replace />;
  }

  return <>{children}</>;
};

export default TrialProtectedRoute;
