import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Single chokepoint for "do you need to be signed in to see this?".
 * Wrap protected route trees in <AuthGuard>...</AuthGuard>.
 *
 * Crucially, while `useAuth()` is in the `reconnecting` state we render the
 * children rather than redirecting — the `SessionVisibilityRefresh` banner
 * shows progress and the session usually returns within a second or two.
 * This eliminates the "tab returns from background → bounced to /auth" race.
 */
interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { state } = useAuth();
  const location = useLocation();

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (state === "unauthenticated") {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // authenticated OR reconnecting — render children.
  // Reconnecting banner is rendered globally by SessionVisibilityRefresh.
  return <>{children}</>;
};

export default AuthGuard;
