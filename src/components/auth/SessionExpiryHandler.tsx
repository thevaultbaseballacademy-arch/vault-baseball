import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { isGloballyReconnecting } from "@/hooks/useAuth";

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) hadSession.current = true;
    });

    const safeRedirect = (title: string, description: string) => {
      // If a refresh is in flight, give it a beat. Re-check after the typical
      // refresh window — if still no session, then it's terminal.
      if (isGloballyReconnecting()) {
        setTimeout(() => {
          if (isGloballyReconnecting()) return; // still trying — let it finish
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
              hadSession.current = false;
              toast({ title, description, variant: "destructive" });
              navigate("/auth", { replace: true });
            }
          });
        }, 2500);
        return;
      }
      hadSession.current = false;
      toast({ title, description, variant: "destructive" });
      navigate("/auth", { replace: true });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_OUT" && hadSession.current) {
          safeRedirect("Session ended", "Please sign in again to continue.");
        }

        if (event === "TOKEN_REFRESHED" && !session && hadSession.current) {
          safeRedirect("Session expired", "Your session has expired. Please sign in again.");
        }

        if (session) {
          hadSession.current = true;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return null;
};

export default SessionExpiryHandler;
