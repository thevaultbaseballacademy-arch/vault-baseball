import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { hasStoredSessionToken, isGloballyReconnecting, subscribeToGlobalReconnecting, waitForRecoveredSession } from "@/lib/authSession";
import { useSubscription } from "@/contexts/SubscriptionContext";

/**
 * Global component that listens for auth state changes and handles
 * session expiry by showing a toast and redirecting to /auth.
 *
 * Mount this once inside BrowserRouter.
 *
 * Phase 2 hardening: every redirect path checks `isGloballyReconnecting()`
 * first. If a refresh is mid-flight (typically iOS Safari BFCache restore),
 * we wait it out instead of bouncing the user to login. The terminal
 * SIGNED_OUT event from a real logout is not gated by this — only the
 * transient "session looks gone but is actually being refreshed" window is.
 */
const SessionExpiryHandler = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const hadSession = useRef(false);
  const { session, user, isLoading } = useSubscription();

  useEffect(() => {
    if (session?.access_token) {
      hadSession.current = true;
      return;
    }

    if (isLoading || isGloballyReconnecting()) return;

    if (hadSession.current && !user) {
      void waitForRecoveredSession({ timeoutMs: 6000, intervalMs: 200 }).then((restoredSession) => {
        if (!restoredSession) {
          hadSession.current = false;
          toast({ title: "Session ended", description: "Please sign in again to continue.", variant: "destructive" });
          navigate("/auth", { replace: true });
        }
      });
    }
  }, [isLoading, navigate, session?.access_token, toast, user]);

  useEffect(() => subscribeToGlobalReconnecting((value) => {
    if (value) return;
    if (!hadSession.current || isLoading || user || hasStoredSessionToken()) return;

    void waitForRecoveredSession({ timeoutMs: 4000, intervalMs: 200 }).then((restoredSession) => {
      if (!restoredSession) {
        hadSession.current = false;
        toast({ title: "Session ended", description: "Please sign in again to continue.", variant: "destructive" });
        navigate("/auth", { replace: true });
      }
    });
  }), [isLoading, navigate, toast, user]);

  return null;
};

export default SessionExpiryHandler;
