// Shared helpers for the unified one-off payment architecture.
//
// All one-off VAULT checkouts (camp, lessons, programs, bundles, certifications)
// route through `payment_orders` so we can:
//  - capture the lead before talking to Stripe
//  - mark `checkout_failed` if Stripe handoff fails
//  - reuse a pending order on idempotent retries
//  - finalize via webhook by `metadata.payment_order_id`
//
// Subscriptions, payouts and locked legacy systems do NOT use this module.

import { createClient, SupabaseClient } from "npm:@supabase/supabase-js@2.57.2";

export type ProductType =
  | "summer_camp"
  | "lesson_package"
  | "program"
  | "bundle"
  | "product"
  | "certification"
  | "facility_lesson";

export interface PendingOrder {
  id: string;
  reference_code: string | null;
  stripe_session_id: string | null;
  checkout_url: string | null;
  status: string;
}

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export function getServiceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );
}

export interface CreatePendingOrderInput {
  productType: ProductType;
  productKey?: string | null;
  productId?: string | null;
  amountCents: number;
  currency?: string;
  customerEmail: string;
  customerName?: string | null;
  userId?: string | null;
  idempotencyKey?: string | null;
  metadata?: Record<string, unknown>;
}

/** Find a reusable pending order created with the same idempotency key in the last hour. */
export async function findReusableOrder(
  supabase: SupabaseClient,
  idempotencyKey: string,
): Promise<PendingOrder | null> {
  const { data } = await supabase
    .from("payment_orders")
    .select("id, reference_code, stripe_session_id, checkout_url, status")
    .eq("idempotency_key", idempotencyKey)
    .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .maybeSingle();
  return (data as PendingOrder | null) ?? null;
}

export async function createPendingOrder(
  supabase: SupabaseClient,
  input: CreatePendingOrderInput,
): Promise<PendingOrder> {
  const { data, error } = await supabase
    .from("payment_orders")
    .insert({
      product_type: input.productType,
      product_key: input.productKey ?? null,
      product_id: input.productId ?? null,
      amount_cents: input.amountCents,
      currency: input.currency ?? "usd",
      payment_method: "card",
      status: "pending",
      customer_email: input.customerEmail,
      customer_name: input.customerName ?? null,
      user_id: input.userId ?? null,
      idempotency_key: input.idempotencyKey ?? null,
      metadata: input.metadata ?? {},
      checkout_started_at: new Date().toISOString(),
    })
    .select("id, reference_code, stripe_session_id, checkout_url, status")
    .single();

  if (error || !data) {
    throw new Error(`payment_orders insert failed: ${error?.message ?? "unknown"}`);
  }
  return data as PendingOrder;
}

export async function attachStripeSession(
  supabase: SupabaseClient,
  orderId: string,
  session: { id: string; url: string | null; expires_at?: number | null },
) {
  await supabase
    .from("payment_orders")
    .update({
      stripe_session_id: session.id,
      checkout_url: session.url,
      expires_at: session.expires_at
        ? new Date(session.expires_at * 1000).toISOString()
        : null,
    })
    .eq("id", orderId);
}

export async function markCheckoutFailed(
  supabase: SupabaseClient,
  orderId: string,
  message: string,
) {
  await supabase
    .from("payment_orders")
    .update({
      status: "checkout_failed",
      error_message: message,
      checkout_last_error: message,
      follow_up_required: true,
      follow_up_reason: "stripe_session_failed",
    })
    .eq("id", orderId);
}

/** Best-effort internal alert so no failed checkout silently disappears. */
export function notifyCheckoutFailed(
  supabase: SupabaseClient,
  payload: {
    orderId: string;
    productType: ProductType;
    customerEmail: string;
    customerName?: string | null;
    amountCents: number;
    error: string;
  },
) {
  supabase.functions
    .invoke("send-transactional-email", {
      body: {
        templateName: "checkout-failed-internal",
        recipientEmail: "emejia2291@gmail.com",
        idempotencyKey: `checkout-failed-${payload.orderId}`,
        templateData: payload,
      },
    })
    .catch(() => void 0);
}
