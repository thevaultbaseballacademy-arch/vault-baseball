import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Mobile/iOS Safari fix: when the tab returns to the foreground (e.g. after a
 * screenshot, an app switch, or memory-pressure backgrounding), the in-memory
 * session can be stale or the storage may have been evicted. Instead of letting
 * the app appear "frozen" or kick the user to /auth, attempt a silent refresh
 * before any UI assumes "logged out".
 *
 * Also runs a lightweight heartbeat every 5 minutes while foregrounded to keep
 * the session warm.
 *
 * Mount once inside BrowserRouter, alongside SessionExpiryHandler.
 */
const SessionVisibilityRefresh = () => {
  useEffect(() => {
    let heartbeat: ReturnType<typeof setInterval> | null = null;

    const tryRefresh = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Silent refresh attempt — if there's a refresh token in storage, this
          // will rehydrate. If not, it's a no-op and SessionExpiryHandler will
          // do its thing on the next auth event.
          await supabase.auth.refreshSession();
        }
      } catch {
        // Swallow — refresh failure is handled by onAuthStateChange elsewhere.
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        tryRefresh();
      }
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      // Safari bfcache restore — also a good moment to revalidate.
      if (e.persisted) tryRefresh();
    };

    const startHeartbeat = () => {
      if (heartbeat) return;
      heartbeat = setInterval(tryRefresh, 5 * 60 * 1000);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleVisibility);
    startHeartbeat();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleVisibility);
      if (heartbeat) clearInterval(heartbeat);
    };
  }, []);

  return null;
};

export default SessionVisibilityRefresh;
