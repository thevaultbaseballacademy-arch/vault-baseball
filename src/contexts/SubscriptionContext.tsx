import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

type SubscriptionTier = "basic" | "performance" | "elite" | null;

interface SubscriptionContextType {
  user: User | null;
  session: Session | null;
  isSubscribed: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionEnd: string | null;
  isLoading: boolean;
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

  const checkSubscription = async (accessToken: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error) throw error;

      setIsSubscribed(data?.subscribed ?? false);
      setSubscriptionTier(data?.product_id ? PRODUCT_TO_TIER[data.product_id] || null : null);
      setSubscriptionEnd(data?.subscription_end ?? null);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setIsSubscribed(false);
      setSubscriptionTier(null);
      setSubscriptionEnd(null);
    }
  };

  const refreshSubscription = async () => {
    if (session?.access_token) {
      await checkSubscription(session.access_token);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.access_token) {
          // Defer subscription check to avoid deadlock
          setTimeout(() => {
            checkSubscription(session.access_token);
          }, 0);
        } else {
          setIsSubscribed(false);
          setSubscriptionTier(null);
          setSubscriptionEnd(null);
        }
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.access_token) {
        checkSubscription(session.access_token);
      }
      setIsLoading(false);
    });

    // Auto-refresh subscription every minute
    const interval = setInterval(() => {
      if (session?.access_token) {
        checkSubscription(session.access_token);
      }
    }, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        user,
        session,
        isSubscribed,
        subscriptionTier,
        subscriptionEnd,
        isLoading,
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
