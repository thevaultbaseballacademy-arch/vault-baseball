// Shared helper for invoking a Stripe-checkout edge function with:
//  - hard client-side timeout (so users never see an infinite spinner)
//  - structured logging for debugging
//  - friendly error messages mapped from edge function error codes
//
// Use this for any "click → pending record → Stripe redirect" flow:
// camp registration, programs, bundles, remote lessons, facility, etc.

import { supabase } from "@/integrations/supabase/client";

export interface CheckoutInvokeResult {
  checkout_url?: string;
  url?: string;
  error?: string;
  code?: string;
  [key: string]: any;
}

const FRIENDLY: Record<string, string> = {
  STRIPE_NOT_CONFIGURED: "Payments are temporarily unavailable. Please try again shortly.",
  INVALID_KEY_TYPE: "Payments are temporarily unavailable. Please try again shortly.",
  AUTH_REQUIRED: "Please sign in to continue with your purchase.",
  AUTH_FAILED: "Please sign in to continue with your purchase.",
  PRICE_NOT_AUTHORIZED: "This product is currently unavailable. Please contact support.",
  INVALID_PRICE: "This product is currently unavailable. Please contact support.",
  CHECKOUT_ERROR: "Unable to start checkout. Please try again.",
  TIMEOUT: "The request took too long. Please check your connection and try again.",
};

export async function invokeCheckout(
  fnName: string,
  body: Record<string, any>,
  opts: { timeoutMs?: number; authToken?: string } = {}
): Promise<{ checkoutUrl: string; raw: CheckoutInvokeResult }> {
  const timeoutMs = opts.timeoutMs ?? 25_000;
  const start = Date.now();
  const tag = `[checkout:${fnName}]`;

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(Object.assign(new Error("TIMEOUT"), { code: "TIMEOUT" })),
      timeoutMs
    )
  );

  try {
    console.log(`${tag} invoking…`, { body: Object.keys(body) });
    const invokePromise = supabase.functions.invoke(fnName, {
      body,
      headers: opts.authToken ? { Authorization: `Bearer ${opts.authToken}` } : undefined,
    });

    const { data, error } = (await Promise.race([invokePromise, timeoutPromise])) as Awaited<
      typeof invokePromise
    >;

    console.log(`${tag} returned in ${Date.now() - start}ms`);

    if (error) {
      console.error(`${tag} invoke error`, error);
      throw new Error(error.message || "Checkout request failed");
    }

    const res = (data ?? {}) as CheckoutInvokeResult;
    if (res.error) {
      const friendly = (res.code && FRIENDLY[res.code]) || res.error;
      console.error(`${tag} edge error`, res);
      throw Object.assign(new Error(friendly), { code: res.code });
    }

    const checkoutUrl = res.checkout_url || res.url;
    if (!checkoutUrl) {
      throw new Error("Checkout session did not return a payment URL.");
    }
    return { checkoutUrl, raw: res };
  } catch (e: any) {
    const code = e?.code || (e?.message === "TIMEOUT" ? "TIMEOUT" : undefined);
    if (code && FRIENDLY[code]) {
      throw Object.assign(new Error(FRIENDLY[code]), { code });
    }
    throw e;
  }
}
