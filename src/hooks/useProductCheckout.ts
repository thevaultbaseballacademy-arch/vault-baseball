import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PRODUCT_PRICES, ProductKey } from '@/lib/productPricing';

export const useProductCheckout = () => {
  const [loading, setLoading] = useState<ProductKey | null>(null);
  const { toast } = useToast();

  const checkout = async (productKey: ProductKey, successUrl?: string, cancelUrl?: string) => {
    const product = PRODUCT_PRICES[productKey];
    if (!product) {
      toast({
        title: 'Error',
        description: 'Product not found',
        variant: 'destructive',
      });
      return;
    }

    setLoading(productKey);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Determine the endpoint based on payment type
      const endpoint = product.type === 'subscription' ? 'create-checkout' : 'create-payment';
      
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: { 
          priceId: product.price_id,
          successUrl,
          cancelUrl,
        },
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`,
        } : undefined,
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Checkout Error',
        description: error.message || 'Failed to start checkout',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return { checkout, loading };
};
