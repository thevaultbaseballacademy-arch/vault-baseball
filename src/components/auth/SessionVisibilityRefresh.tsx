import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

/**
 * Mobile/iOS Safari fix: when the tab returns to the foreground (screenshot,
 * app switch, BFCache restore, memory-pressure eviction), the in-memory session
 * can be stale. Instead of letting the app feel frozen or bounce to /auth,
 * we proactively call refreshSession() and show a non-blocking "Reconnecting…"
 * banner so the user sees we're recovering, not broken.
 *
 * Listener strategy:
 *   - visibilitychange: cheap path, only refresh if getSession() is empty
 *   - pageshow + e.persisted: BFCache restore (visibilitychange may not fire)
 *   - focus: belt & suspenders for desktop window focus
 *   - 5-min heartbeat: keeps session warm while foregrounded
 *
 * Mount once inside BrowserRouter, alongside SessionExpiryHandler.
 */
const SessionVisibilityRefresh = () => {
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    let heartbeat: ReturnType<typeof setInterval> | null = null;
    let inFlight = false;

    const tryRefresh = async (force = false) => {
      if (inFlight) return;
      inFlight = true;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || force) {
          setReconnecting(true);
          await supabase.auth.refreshSession();
        }
      } catch {
        // Swallow — onAuthStateChange / SessionExpiryHandler handle terminal failures
      } finally {
        inFlight = false;
        setReconnecting(false);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") tryRefresh();
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      // BFCache restore is the iOS Safari case visibilitychange misses
      if (e.persisted) tryRefresh(true);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleVisibility);
    heartbeat = setInterval(() => tryRefresh(), 5 * 60 * 1000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleVisibility);
      if (heartbeat) clearInterval(heartbeat);
    };
  }, []);

  if (!reconnecting) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] bg-background/95 backdrop-blur border border-border rounded-full px-3 py-1.5 shadow-lg flex items-center gap-2 text-xs text-foreground"
    >
      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
      Reconnecting…
    </div>
  );
};

export default SessionVisibilityRefresh;
