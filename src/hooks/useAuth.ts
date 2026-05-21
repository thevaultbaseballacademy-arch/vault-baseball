import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

/**
 * Centralized auth state machine. Phase 2 introduces this as the single
 * source of truth for "am I logged in" so future routes don't each call
 * `navigate('/auth')` on their own. Existing call sites continue to work
 * unchanged — this is purely additive until they're migrated one-by-one.
 *
 * States:
 *   - loading:        first hydration in progress, don't render protected UI yet
 *   - authenticated:  session is valid, render normally
 *   - reconnecting:   session was valid, currently refreshing (e.g. iOS BFCache);
 *                     do NOT redirect — wait it out, the banner shows progress
 *   - unauthenticated: no session and not actively recovering, safe to redirect
 */
export type AuthState =
  | "loading"
  | "authenticated"
  | "reconnecting"
  | "unauthenticated";

let globalReconnecting = false;
const reconnectingListeners = new Set<(v: boolean) => void>();

/** Called by SessionVisibilityRefresh to mark a refresh window. */
export const setGlobalReconnecting = (v: boolean) => {
  globalReconnecting = v;
  reconnectingListeners.forEach((cb) => cb(v));
};

/**
 * Synchronous read of the global reconnecting flag. Used by above-guard
 * components like SessionExpiryHandler that need to suppress hard redirects
 * while a session refresh is in flight (avoids the iOS BFCache → /auth race).
 */
export const isGloballyReconnecting = () => globalReconnecting;

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [reconnecting, setReconnecting] = useState(globalReconnecting);

  useEffect(() => {
    // Listener FIRST per Supabase guidance, THEN hydrate.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
      },
    );

    // Soft timeout: if Supabase auth hangs, flip `hydrated` so the UI can
    // render — but if we can see a persisted session token in localStorage,
    // mark the state as reconnecting (NOT unauthenticated) so AuthGuard
    // keeps the user on the page instead of bouncing them to /auth.
    const hasStoredSession = () => {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith("sb-") && k.endsWith("-auth-token")) {
            const v = localStorage.getItem(k);
            if (v && v.length > 10) return true;
          }
        }
      } catch {
        // ignore (private mode, etc.)
      }
      return false;
    };

    let resolved = false;
    const hydrationTimeout = window.setTimeout(() => {
      if (resolved) return;
      if (hasStoredSession()) {
        // Treat as reconnecting — onAuthStateChange will fire when it recovers.
        setGlobalReconnecting(true);
      }
      setHydrated(true);
    }, 15000);

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      resolved = true;
      window.clearTimeout(hydrationTimeout);
      setGlobalReconnecting(false);
      setSession(s);
      setUser(s?.user ?? null);
      setHydrated(true);
    }).catch((err) => {
      resolved = true;
      console.error("[useAuth] getSession() failed", err);
      window.clearTimeout(hydrationTimeout);
      if (hasStoredSession()) setGlobalReconnecting(true);
      setHydrated(true);
    });

    const onReconnecting = (v: boolean) => setReconnecting(v);
    reconnectingListeners.add(onReconnecting);

    return () => {
      subscription.unsubscribe();
      reconnectingListeners.delete(onReconnecting);
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  let state: AuthState;
  if (!hydrated) state = "loading";
  else if (session) state = "authenticated";
  else if (reconnecting) state = "reconnecting";
  else state = "unauthenticated";

  return { state, session, user, signOut };
};
