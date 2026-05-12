import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PRODUCT_PRICES, ProductKey } from '@/lib/productPricing';
import { openCheckout } from '@/lib/openCheckout';
import { invokeCheckout } from '@/lib/checkoutInvoke';

export const useProductCheckout = () => {
  const [loading, setLoading] = useState<ProductKey | null>(null);
  const { toast } = useToast();

  const checkout = async (productKey: ProductKey, successUrl?: string, cancelUrl?: string) => {
    const product = PRODUCT_PRICES[productKey];
    if (!product) {
      toast({ title: 'Error', description: 'Product not found', variant: 'destructive' });
      return;
    }

    setLoading(productKey);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const endpoint = product.type === 'subscription' ? 'create-checkout' : 'create-payment';

      if (product.type === 'subscription' && !session) {
        toast({
          title: 'Sign In Required',
          description: 'Please sign in to subscribe to this plan.',
          variant: 'destructive',
        });
        setLoading(null);
        return;
      }

      // Immediate feedback — never leave the user wondering if their click registered.
      toast({
        title: 'Starting secure checkout…',
        description: 'Redirecting to Stripe. This usually takes a few seconds.',
      });

      const { checkoutUrl } = await invokeCheckout(
        endpoint,
        { priceId: product.price_id, successUrl, cancelUrl },
        { authToken: session?.access_token, timeoutMs: 25_000 },
      );
      await openCheckout(checkoutUrl);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to start checkout';
      toast({ title: 'Checkout Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  return { checkout, loading };
};
