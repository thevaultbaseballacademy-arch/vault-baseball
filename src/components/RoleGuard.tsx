import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Permission } from "@/lib/permissions";
import { useRoleAuth } from "@/hooks/useRoleAuth";

interface RoleGuardProps {
  children: React.ReactNode;
  /** Permission required to access this route */
  requires: Permission;
  /** Optional: redirect to a custom path on denial (default: auth or home) */
  fallback?: string;
}

/**
 * Route guard that enforces permission-based access.
 * Wraps children and redirects unauthorized users.
 *
 * Usage:
 *   <Route path="/owner" element={
 *     <RoleGuard requires="dashboard.owner"><OwnerPage /></RoleGuard>
 *   } />
 */
const RoleGuard = ({ children, requires, fallback }: RoleGuardProps) => {
  const { user, can, isLoading } = useRoleAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!can(requires)) {
    return <Navigate to={fallback || "/dashboard"} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
