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
  CHECKOUT_RETRYABLE: "Checkout is taking longer than expected. Retrying now…",
  NETWORK_ERROR: "We couldn't reach checkout. Please try again.",
  TIMEOUT: "The request took too long. Please check your connection and try again.",
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function invokeCheckout(
  fnName: string,
  body: Record<string, any>,
  opts: {
    timeoutMs?: number;
    authToken?: string;
    retries?: number;
    retryDelayMs?: number;
    retryOnCodes?: string[];
    onRetry?: (ctx: { attempt: number; code?: string }) => void;
  } = {}
): Promise<{ checkoutUrl: string; raw: CheckoutInvokeResult }> {
  const timeoutMs = opts.timeoutMs ?? 25_000;
  const retries = Math.max(0, opts.retries ?? 0);
  const retryDelayMs = Math.max(0, opts.retryDelayMs ?? 1_500);
  const retryOnCodes = new Set(opts.retryOnCodes ?? ["TIMEOUT", "CHECKOUT_RETRYABLE", "NETWORK_ERROR"]);
  const start = Date.now();
  const tag = `[checkout:${fnName}]`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(Object.assign(new Error("TIMEOUT"), { code: "TIMEOUT" })),
        timeoutMs
      )
    );

    try {
      console.log(`${tag} invoking…`, { body: Object.keys(body), attempt: attempt + 1 });
      const invokePromise = supabase.functions.invoke(fnName, {
        body,
        headers: opts.authToken ? { Authorization: `Bearer ${opts.authToken}` } : undefined,
      });

      const { data, error } = (await Promise.race([invokePromise, timeoutPromise])) as Awaited<
        typeof invokePromise
      >;

      console.log(`${tag} returned in ${Date.now() - start}ms`, { attempt: attempt + 1 });

      if (error) {
        const ctxBody = (error as any)?.context?.body;
        const code = ctxBody?.code || (typeof ctxBody === "object" ? ctxBody?.error_code : undefined);
        const message = ctxBody?.error || error.message || "Checkout request failed";
        console.error(`${tag} invoke error`, { error, ctxBody, attempt: attempt + 1 });
        throw Object.assign(new Error(message), {
          code: code || (/Failed to send a request|network|fetch/i.test(message) ? "NETWORK_ERROR" : undefined),
        });
      }

      const res = (data ?? {}) as CheckoutInvokeResult;
      if (res.error) {
        console.error(`${tag} edge error`, { res, attempt: attempt + 1 });
        throw Object.assign(new Error(res.error), { code: res.code });
      }

      const checkoutUrl = res.checkout_url || res.url;
      if (!checkoutUrl) {
        throw new Error("Checkout session did not return a payment URL.");
      }

      return { checkoutUrl, raw: res };
    } catch (e: any) {
      const code =
        e?.code ||
        (e?.message === "TIMEOUT"
          ? "TIMEOUT"
          : /Failed to send a request|network|fetch/i.test(e?.message ?? "")
            ? "NETWORK_ERROR"
            : undefined);

      const normalizedError = code && FRIENDLY[code]
        ? Object.assign(new Error(FRIENDLY[code]), { code })
        : e;

      const shouldRetry = attempt < retries && !!code && retryOnCodes.has(code);
      if (shouldRetry) {
        console.warn(`${tag} retrying after ${code}`, { attempt: attempt + 1, retries });
        opts.onRetry?.({ attempt: attempt + 1, code });
        if (retryDelayMs > 0) await sleep(retryDelayMs);
        continue;
      }

      throw normalizedError;
    }
  }

  throw new Error("Checkout request failed");
}
