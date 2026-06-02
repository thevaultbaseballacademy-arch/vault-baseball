import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  isGloballyReconnecting,
  setGlobalReconnecting,
} from "@/lib/authSession";
import { useSubscription } from "@/contexts/SubscriptionContext";

export { isGloballyReconnecting, setGlobalReconnecting } from "@/lib/authSession";

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
  const { user, session, isLoading } = useSubscription();
  const reconnecting = isGloballyReconnecting();

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  let state: AuthState;
  if (isLoading && !user && !reconnecting) state = "loading";
  else if (session) state = "authenticated";
  else if (reconnecting) state = "reconnecting";
  else state = "unauthenticated";

  return { state, session, user, signOut };
};
