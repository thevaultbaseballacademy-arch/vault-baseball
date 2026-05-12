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

      // One-off payments use the shared payment_orders architecture; subscriptions go straight to create-checkout.
      const isSubscription = product.type === 'subscription';
      const idempotencyKey = isSubscription
        ? undefined
        : `pp_${productKey}_${session?.user?.id ?? 'guest'}_${Math.floor(Date.now() / 60000)}`;

      const { checkoutUrl } = await invokeCheckout(
        endpoint,
        {
          priceId: product.price_id,
          successUrl,
          cancelUrl,
          ...(isSubscription
            ? {}
            : {
                product_type: /pack$/i.test(productKey)
                  ? 'bundle'
                  : /system|blueprint|intensive|prep|accelerator/i.test(productKey)
                    ? 'program'
                    : 'product',
                product_key: productKey,
                amount_cents: (product as { price: number }).price,
                customer_email: session?.user?.email,
                idempotency_key: idempotencyKey,
              }),
        },
        { authToken: session?.access_token, timeoutMs: 25_000 },
      );
      await openCheckout(checkoutUrl);
    } catch (error: any) {
      if (error?.code === 'CHECKOUT_FAILED_FOLLOWUP') {
        toast({
          title: 'We saved your order',
          description: "Secure checkout didn't open. Our team will reach out to finish payment.",
        });
      } else {
        const message = error instanceof Error ? error.message : 'Failed to start checkout';
        toast({ title: 'Checkout Error', description: message, variant: 'destructive' });
      }
    } finally {
      setLoading(null);
    }
  };

  return { checkout, loading };
};
