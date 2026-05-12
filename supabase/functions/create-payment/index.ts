import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import {
  attachStripeSession,
  corsHeaders,
  createPendingOrder,
  findReusableOrder,
  getServiceClient,
  json,
  markCheckoutFailed,
  notifyCheckoutFailed,
  ProductType,
} from "../_shared/payment-orders.ts";

// Whitelist of valid Stripe price IDs for one-time payments
const VALID_PAYMENT_PRICE_IDS = [
  // Full Release Systems
  'price_1SqEGAPhXS410TO5ZIx2g0RZ',
  'price_1SqEGCPhXS410TO5iCsokNpV',
  // Stand-alone Products
  'price_1T8ckXPhXS410TO5tYyygmol',
  'price_1T8ckYPhXS410TO5WkQI2EpC',
  // Legacy prices
  'price_1SqEGGPhXS410TO52G0rlmEk',
  'price_1SqEW4PhXS410TO51a1fzsw1',
  'price_1SqEGKPhXS410TO5JALh4Imp',
  'price_1SqEGMPhXS410TO5PNwPNJOe',
  // Bundles
  'price_1SqEW6PhXS410TO5GbLVm4te',
  'price_1SqEW8PhXS410TO5A7WuQgc6',
  'price_1SqEW9PhXS410TO5detPNFap',
  // Revenue Products
  'price_1SqMSsPhXS410TO5HQjuGUIn',
  'price_1SqMSuPhXS410TO5ymOiyyUa',
  'price_1SqMSxPhXS410TO5rYo4echT',
  'price_1SqMSzPhXS410TO5VpvnedaW',
  // High-Ticket
  'price_1SqNiiPhXS410TO51M25fyJR',
  'price_1StVz1PhXS410TO5hktrpoe1',
  'price_1SqNikPhXS410TO5rLuqRrBn',
  // Lesson Packages
  'price_1T1LZOPhXS410TO5lhAYrmKO',
  'price_1T1LZNPhXS410TO5u5o2Szl4',
  // Summer Camp 2026
  'price_1TVZTFPhXS410TO5Mi4IcUTx',
  'price_1TVZTGPhXS410TO5rM6oDJ8v',
  'price_1TVZh9PhXS410TO5HP7ytMkO',
  'price_1TVZhAPhXS410TO5EFYaacZ6',
];

const VALID_PRODUCT_TYPES: ProductType[] = [
  "lesson_package",
  "program",
  "bundle",
  "product",
];

const log = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey || stripeKey.startsWith("pk_")) {
      return json({ error: "Payment system not configured", code: "STRIPE_NOT_CONFIGURED" }, 500);
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid request format", code: "INVALID_REQUEST" }, 400);
    }

    const {
      priceId,
      successUrl,
      cancelUrl,
      quantity: rawQty,
      product_type: productTypeRaw,
      product_key: productKey,
      product_id: productId,
      idempotency_key: idempotencyKey,
      amount_cents: amountCentsRaw,
      customer_email: guestEmail,
      customer_name: guestName,
      metadata: extraMetadata,
    } = body as Record<string, any>;

    const quantity = Math.max(
      1,
      Math.min(10, Number.isFinite(Number(rawQty)) ? Math.floor(Number(rawQty)) : 1),
    );

    if (!priceId || typeof priceId !== "string") {
      return json({ error: "Invalid price ID format", code: "INVALID_PRICE_ID" }, 400);
    }
    if (!VALID_PAYMENT_PRICE_IDS.includes(priceId)) {
      log("Unauthorized price ID", { priceId });
      return json({ error: "This product is not available for purchase", code: "PRICE_NOT_AUTHORIZED" }, 400);
    }

    const productType: ProductType =
      typeof productTypeRaw === "string" && VALID_PRODUCT_TYPES.includes(productTypeRaw as ProductType)
        ? (productTypeRaw as ProductType)
        : "product";

    // Try to identify the user (auth optional for one-off)
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const supabase = getServiceClient();
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    let userEmail: string | undefined;
    let userId: string | undefined;
    let customerId: string | undefined;

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      try {
        const { data, error } = await anonClient.auth.getUser(token);
        if (!error && data.user?.email) {
          userEmail = data.user.email;
          userId = data.user.id;
          try {
            const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
            if (customers.data.length > 0) customerId = customers.data[0].id;
          } catch (e) {
            log("WARN customer lookup failed", { error: String(e) });
          }
        }
      } catch (e) {
        log("WARN auth failed (continuing as guest)", { error: String(e) });
      }
    }

    const customerEmail =
      (typeof guestEmail === "string" ? guestEmail.trim().toLowerCase() : "") || userEmail || "";
    if (!customerEmail) {
      return json({ error: "Sign in or provide an email to continue.", code: "AUTH_REQUIRED" }, 401);
    }

    // ─── Idempotency ────────────────────────────────────────────────
    if (typeof idempotencyKey === "string" && idempotencyKey.length > 0) {
      const existing = await findReusableOrder(supabase, idempotencyKey);
      if (existing && existing.status === "pending" && existing.checkout_url) {
        log("idempotent reuse", { orderId: existing.id });
        return json({
          success: true,
          reused: true,
          order_id: existing.id,
          checkout_url: existing.checkout_url,
          url: existing.checkout_url, // backward-compat
        });
      }
    }

    // ─── Capture lead BEFORE Stripe ────────────────────────────────
    const order = await createPendingOrder(supabase, {
      productType,
      productKey: typeof productKey === "string" ? productKey : null,
      productId: typeof productId === "string" ? productId : null,
      amountCents: Number.isFinite(Number(amountCentsRaw)) ? Number(amountCentsRaw) : 0,
      customerEmail,
      customerName: typeof guestName === "string" ? guestName : null,
      userId: userId ?? null,
      idempotencyKey: typeof idempotencyKey === "string" ? idempotencyKey : null,
      metadata: {
        price_id: priceId,
        quantity,
        product_key: productKey ?? null,
        ...(extraMetadata && typeof extraMetadata === "object" ? extraMetadata : {}),
      },
    });

    const origin = req.headers.get("origin") || "https://vault-baseball.lovable.app";

    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : customerEmail,
        line_items: [{ price: priceId, quantity }],
        mode: "payment",
        success_url: successUrl || `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${origin}/payment-canceled`,
        allow_promotion_codes: true,
        metadata: {
          user_id: userId || "guest",
          price_id: priceId,
          payment_order_id: order.id,
          product_type: productType,
        },
      });

      await attachStripeSession(supabase, order.id, session);

      log("checkout ready", { sessionId: session.id, orderId: order.id });
      return json({
        success: true,
        order_id: order.id,
        checkout_url: session.url,
        url: session.url, // backward-compat for older callers
      });
    } catch (stripeErr) {
      const message = stripeErr instanceof Error ? stripeErr.message : String(stripeErr);
      log("ERROR stripe session", { message });
      await markCheckoutFailed(supabase, order.id, message);
      notifyCheckoutFailed(supabase, {
        orderId: order.id,
        productType,
        customerEmail,
        customerName: typeof guestName === "string" ? guestName : null,
        amountCents: Number.isFinite(Number(amountCentsRaw)) ? Number(amountCentsRaw) : 0,
        error: message,
      });

      const isPriceError = message.includes("No such price");
      return json(
        {
          error: isPriceError
            ? "Product pricing configuration error. Please contact support."
            : "We saved your details but couldn't open secure checkout.",
          code: isPriceError ? "INVALID_PRICE" : "CHECKOUT_FAILED_FOLLOWUP",
          order_id: order.id,
        },
        isPriceError ? 400 : 502,
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log("ERROR unexpected", { message });
    return json(
      { error: "An error occurred during checkout. Please try again.", code: "CHECKOUT_ERROR" },
      500,
    );
  }
});
