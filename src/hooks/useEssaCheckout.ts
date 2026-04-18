import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { openCheckout } from "@/lib/openCheckout";
import { hapticImpact, hapticSuccess } from "@/lib/haptics";
import { toast } from "sonner";

type CheckoutArgs = {
  priceId: string;
  quantity?: number;
  metadata?: Record<string, string>;
};

/**
 * Hook for ESSA facility one-time checkouts (private lessons + packages).
 * Routes through the create-facility-checkout edge function and uses
 * openCheckout so it works correctly in iOS/Android Capacitor builds.
 */
export const useEssaCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);

  const startCheckout = async ({ priceId, quantity = 1, metadata }: CheckoutArgs) => {
    if (isLoading) return; // prevent double-tap submissions
    setIsLoading(true);
    await hapticImpact("Medium");

    try {
      // Require auth before invoking — gives a cleaner UX than the 401 from the function
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error("Please sign in to book a session.");
        window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-facility-checkout", {
        body: { priceId, quantity, metadata },
      });

      if (error) {
        console.error("[ESSA checkout] invoke error", error);
        toast.error(error.message || "Could not start checkout. Please try again.");
        return;
      }

      if (!data?.url) {
        toast.error(data?.error || "No checkout URL returned. Please try again.");
        return;
      }

      await hapticSuccess();
      await openCheckout(data.url);
    } catch (err: any) {
      console.error("[ESSA checkout] error", err);
      toast.error(err?.message || "Something went wrong starting checkout.");
    } finally {
      setIsLoading(false);
    }
  };

  return { startCheckout, isLoading };
};
