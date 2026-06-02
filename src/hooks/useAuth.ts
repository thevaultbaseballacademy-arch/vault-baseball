import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import {
  hasStoredSessionToken,
  isGloballyReconnecting,
  setGlobalReconnecting,
  subscribeToGlobalReconnecting,
} from "@/lib/authSession";

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

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [reconnecting, setReconnecting] = useState(isGloballyReconnecting());

  useEffect(() => {
    const applyAuthState = (nextSession: Session | null) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.access_token) {
        setGlobalReconnecting(false);
      }
      setHydrated(true);
    };

    const reverifySession = () => {
      void supabase.auth.getSession().then(({ data: { session: verified } }) => {
        if (verified?.access_token) {
          applyAuthState(verified);
          return;
        }

        if (hasStoredSessionToken()) {
          setGlobalReconnecting(true);
          setHydrated(true);
          return;
        }

        setGlobalReconnecting(false);
        applyAuthState(null);
      }).catch((err) => {
        console.error("[useAuth] session recheck failed", err);
        if (hasStoredSessionToken()) {
          setGlobalReconnecting(true);
          setHydrated(true);
          return;
        }

        setGlobalReconnecting(false);
        applyAuthState(null);
      });
    };

    // Listener FIRST per Supabase guidance, THEN hydrate.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, s) => {
        if (s?.access_token) {
          applyAuthState(s);
          return;
        }

        if (event === "INITIAL_SESSION") {
          return;
        }

        // Token refresh / visibility restore can briefly emit a null session
        // before storage hydration finishes. Re-verify before deciding the user
        // is truly signed out.
        reverifySession();
      },
    );

    // Soft timeout: if Supabase auth hangs, flip `hydrated` so the UI can
    // render — but if we can see a persisted session token in localStorage,
    // mark the state as reconnecting (NOT unauthenticated) so AuthGuard
    // keeps the user on the page instead of bouncing them to /auth.
    let resolved = false;
    const hydrationTimeout = window.setTimeout(() => {
      if (resolved) return;
      if (hasStoredSessionToken()) {
        // Treat as reconnecting — onAuthStateChange will fire when it recovers.
        setGlobalReconnecting(true);
      }
      setHydrated(true);
    }, 15000);

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      resolved = true;
      window.clearTimeout(hydrationTimeout);
      if (s?.access_token) {
        applyAuthState(s);
        return;
      }

      if (hasStoredSessionToken()) {
        setGlobalReconnecting(true);
        setHydrated(true);
        return;
      }

      setGlobalReconnecting(false);
      applyAuthState(null);
    }).catch((err) => {
      resolved = true;
      console.error("[useAuth] getSession() failed", err);
      window.clearTimeout(hydrationTimeout);
      if (hasStoredSessionToken()) {
        setGlobalReconnecting(true);
        setHydrated(true);
        return;
      }

      setGlobalReconnecting(false);
      applyAuthState(null);
    });

    const unsubscribe = subscribeToGlobalReconnecting((v) => setReconnecting(v));

    return () => {
      subscription.unsubscribe();
      unsubscribe();
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
