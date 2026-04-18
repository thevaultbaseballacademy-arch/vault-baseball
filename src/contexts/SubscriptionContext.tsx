import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { usePushNotifications } from "@/hooks/usePushNotifications";

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

  usePushNotifications(user?.id);

  const resetSubscriptionState = useCallback(() => {
    setIsSubscribed(false);
    setSubscriptionTier(null);
    setSubscriptionEnd(null);
    setHasTeamAccess(false);
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

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      sessionRef.current = nextSession;
      userRef.current = nextSession?.user ?? null;

      if (!nextSession?.access_token) {
        resetSubscriptionState();
        if (active) setIsLoading(false);
        return;
      }

      await checkSubscription(nextSession.access_token, nextSession.user?.email);

      if (active) {
        setIsLoading(false);
      }
    };

    const initializeAuth = async () => {
      setIsLoading(true);
      const { data: { session: restoredSession } } = await supabase.auth.getSession();
      await syncSessionState(restoredSession);
    };

    void initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "INITIAL_SESSION") return;
      setIsLoading(true);
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
  }, [checkSubscription, resetSubscriptionState]);

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
