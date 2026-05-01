import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { isGloballyReconnecting } from "@/hooks/useAuth";

/**
 * Drop-in replacement for the legacy per-page pattern:
 *
 *   supabase.auth.getSession().then(({ data: { session } }) => {
 *     if (!session?.user) navigate("/auth");
 *     ...
 *   });
 *   const { data: { subscription } } = supabase.auth.onAuthStateChange(...)
 *
 * That pattern races the auth hydration and bounces users to /auth when
 * `getSession` resolves before the cached session is hydrated, and again
 * on iOS BFCache restores. This hook centralizes the rules:
 *
 *   - Wait for `useSubscription().isLoading === false` before redirecting.
 *   - Don't redirect at all while a global reconnect (visibility refresh) is
 *     in flight.
 *   - Returns `{ user, loading }` so pages can render their own skeletons.
 *
 * Pages should treat `loading === true` as "show spinner, do nothing", and
 * only fetch their data when `user` is truthy.
 */
export const useAuthGate = (redirectTo: string = "/auth") => {
  const { user, session, isLoading } = useSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (user) return;
    if (isGloballyReconnecting()) return;
    navigate(redirectTo, { replace: true });
  }, [user, isLoading, navigate, redirectTo]);

  return {
    user,
    session,
    loading: isLoading || (!user && isGloballyReconnecting()),
  };
};
