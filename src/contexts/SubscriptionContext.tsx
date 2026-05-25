import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { setGlobalReconnecting } from "@/hooks/useAuth";

type SubscriptionTier = "basic" | "performance" | "elite" | null;

interface SubscriptionContextType {
  user: User | null;
  session: Session | null;
  isSubscribed: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionEnd: string | null;
  isLoading: boolean;
  hasTeamAccess: boolean;
  refreshSubscription: () => Promise<void>;
}

const PRODUCT_TO_TIER: Record<string, SubscriptionTier> = {
  "prod_TgddaadHxz0mTj": "basic",
  "prod_TgddQA4gp7kWZy": "performance",
  "prod_Tgdd8gSJpkk33e": "elite",
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTeamAccess, setHasTeamAccess] = useState(false);

  const sessionRef = useRef<Session | null>(null);
  const userRef = useRef<User | null>(null);
  const restoreAttemptRef = useRef(0);

  const applySessionState = useCallback((nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
    sessionRef.current = nextSession;
    userRef.current = nextSession?.user ?? null;
  }, []);

  usePushNotifications(user?.id);

  const resetSubscriptionState = useCallback(() => {
    setIsSubscribed(false);
    setSubscriptionTier(null);
    setSubscriptionEnd(null);
    setHasTeamAccess(false);
  }, []);

  const hasStoredSessionToken = useCallback(() => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("sb-") && key.endsWith("-auth-token")) {
          const value = localStorage.getItem(key);
          if (value && value.length > 10) return true;
        }
      }
    } catch {
      // ignore storage access issues
    }

    return false;
  }, []);

  const checkTeamAccess = useCallback(async (email: string | undefined) => {
    if (!email) {
      setHasTeamAccess(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("team_whitelist")
        .select("full_access")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      setHasTeamAccess(data?.full_access ?? false);
    } catch {
      setHasTeamAccess(false);
    }
  }, []);

  const checkSubscription = useCallback(async (accessToken: string, userEmail?: string) => {
    try {
      const [, subResult] = await Promise.all([
        checkTeamAccess(userEmail),
        supabase.functions.invoke("check-subscription", {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      const { data, error } = subResult;
      if (error) throw error;

      setIsSubscribed(data?.subscribed ?? false);
      setSubscriptionTier(data?.product_id ? PRODUCT_TO_TIER[data.product_id] || null : null);
      setSubscriptionEnd(data?.subscription_end ?? null);
    } catch (error) {
      console.error("Error checking subscription:", error);
      resetSubscriptionState();
    }
  }, [checkTeamAccess, resetSubscriptionState]);

  const refreshSubscription = useCallback(async () => {
    if (sessionRef.current?.access_token) {
      await checkSubscription(sessionRef.current.access_token, userRef.current?.email);
    }
  }, [checkSubscription]);

  useEffect(() => {
    let active = true;

    const syncSessionState = async (nextSession: Session | null) => {
      if (!active) return;

       restoreAttemptRef.current += 1;

      applySessionState(nextSession);

      if (!nextSession?.access_token) {
        setGlobalReconnecting(false);
        resetSubscriptionState();
        if (active) setIsLoading(false);
        return;
      }

      if (active) {
        setGlobalReconnecting(false);
        setIsLoading(false);
      }

      void checkSubscription(nextSession.access_token, nextSession.user?.email);
    };

    const recoverPersistedSession = async (reason: string) => {
      const attemptId = ++restoreAttemptRef.current;

      if (!hasStoredSessionToken()) {
        setGlobalReconnecting(false);
        await syncSessionState(null);
        return;
      }

      setGlobalReconnecting(true);
      setIsLoading(true);

      const startedAt = Date.now();
      const maxWaitMs = 12000;

      while (active && attemptId === restoreAttemptRef.current && Date.now() - startedAt < maxWaitMs) {
        const { data: { session: verified } } = await supabase.auth.getSession();

        if (!active || attemptId !== restoreAttemptRef.current) return;

        if (verified?.access_token) {
          await syncSessionState(verified);
          return;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 350));
      }

      if (!active || attemptId !== restoreAttemptRef.current) return;

      console.warn(`[SubscriptionContext] persisted session recovery timed out during ${reason}`);

      await syncSessionState(null);
    };

    const initializeAuth = async () => {
      setIsLoading(true);
      const { data: { session: restoredSession } } = await supabase.auth.getSession();
      if (!restoredSession?.access_token && hasStoredSessionToken()) {
        await recoverPersistedSession("initial load");
        return;
      }

      await syncSessionState(restoredSession);
    };

    void initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "INITIAL_SESSION") return;

      // Guard: token refresh, tab restore, and even occasional transient
      // SIGNED_OUT events can briefly present a null session before auth
      // storage finishes settling. Re-verify before clearing shared user state
      // so route guards never bounce a still-signed-in user back to /auth.
      if (!nextSession?.access_token) {
        void recoverPersistedSession(`auth event ${event}`);
        return;
      }

      applySessionState(nextSession);

      if (!nextSession?.access_token) {
        setGlobalReconnecting(false);
        resetSubscriptionState();
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      void syncSessionState(nextSession);
    });

    const interval = setInterval(() => {
      if (sessionRef.current?.access_token) {
        void checkSubscription(sessionRef.current.access_token, userRef.current?.email);
      }
    }, 300000);

    return () => {
      active = false;
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [applySessionState, checkSubscription, resetSubscriptionState]);

  return (
    <SubscriptionContext.Provider
      value={{
        user,
        session,
        isSubscribed: isSubscribed || hasTeamAccess,
        subscriptionTier: hasTeamAccess ? "elite" : subscriptionTier,
        subscriptionEnd,
        isLoading,
        hasTeamAccess,
        refreshSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
