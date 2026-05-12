# Phase 2 — Rollout Plan: Shared Checkout Across VAULT

## Scope decision

The Phase 1 architecture (`payment_orders` row → fast Stripe session → `checkout_failed` lead capture → idempotency key) only fits **one-off** payments. Subscriptions, payouts, and the locked legacy ESSA/Course flows must not be folded in.

| Edge function | Today's role | Phase 2 action |
|---|---|---|
| `register-summer-camp` | Summer camp one-off | ✅ Done in Phase 1 |
| `create-payment` | Generic one-off (lessons, bundles, programs via `useProductCheckout`) | **Migrate** to shared architecture |
| `certification-checkout` | Certification one-off | **Migrate** to shared architecture |
| `create-facility-checkout` | ESSA facility lessons/packages | **Wrap** — keep the function (it's part of the locked ESSA system per project memory), but standardize the client error handling and logging only |
| `create-checkout` | Subscriptions (Pricing, Trial, products) | **Leave alone** — subscriptions use Stripe's own lifecycle; do not force into `payment_orders` |
| `camp-stripe-webhook` / `essa-stripe-webhook` / `verify-summer-camp-payment` / `verify-camp-payment` | Stripe → DB sync | **Extend** webhooks to also finalize `payment_orders` via the existing `finalize_summer_camp_payment_order` pattern, generalized |
| `process-coach-payout` | Connect payouts | Out of scope |

## State model (unchanged from Phase 1)

```text
              ┌──── paid ────────────────────────► confirmed
pending ─────►├──── canceled ────────────────────► canceled
              ├──── checkout_failed ─────────────► pending_followup (admin queue)
              └──── (Stripe webhook timeout 24h) ─► failed
pending_bank_transfer ─── admin confirm ─────────► paid
```

## Implementation steps (in order)

### Step 1 — Generalize the shared helpers

Create `supabase/functions/_shared/payment-orders.ts` (Deno-compatible) exporting:
- `createPendingOrder({ supabase, productType, amountCents, customerEmail, customerName, idempotencyKey, metadata, productId? })` → returns `{ id, reference_code }`
- `markCheckoutFailed(supabase, orderId, message)` and `attachStripeSession(supabase, orderId, session)`
- `findReusableOrder(supabase, idempotencyKey)`

Both `register-summer-camp`, `create-payment`, and `certification-checkout` import from this single module.

### Step 2 — Migrate `create-payment`

Used by `useProductCheckout` for one-off products and `LessonPackages.tsx` for lesson-package purchases. The migrated function:
1. Validates `priceId` and customer email (auth user OR guest email).
2. Creates a `payment_orders` row with `product_type` = body.product_type (e.g. `'lesson_package'`, `'program'`, `'bundle'`, `'product'`) and `product_id` = body.product_id when present.
3. Creates the Stripe session (mode `payment`).
4. On Stripe failure → marks the order `checkout_failed`, returns `CHECKOUT_FAILED_FOLLOWUP` with `order_id`.
5. Returns `{ checkout_url, order_id }`.

Frontend `useProductCheckout` is updated to:
- Generate an `idempotency_key` per click cycle.
- Use `invokeCheckout()` from `src/lib/checkoutInvoke.ts` (already handles sanitized errors + retry).
- Pass `product_type` so the order is categorized.

### Step 3 — Migrate `certification-checkout`

Same shape as `create-payment` but with `product_type = 'certification'`. `Certifications.tsx` switches to `invokeCheckout()` and sends an `idempotency_key`.

### Step 4 — Standardize client error handling for ESSA facility

Do **not** restructure the facility edge function (locked legacy). Only update `useEssaCheckout.ts` to:
- Use `invokeCheckout()` so users see sanitized errors instead of raw Stripe URLs / "request timed out" copy.
- Add a per-attempt idempotency key passed through to the function (the function already accepts arbitrary metadata).

If the user later decides to retire the facility legacy, that is a separate, scoped task.

### Step 5 — Extend Stripe webhook(s) to finalize `payment_orders`

Generalize the existing `finalize_summer_camp_payment_order` SQL function into `finalize_payment_order(p_order_id, p_status, ...)` that updates only the order. Per-product table updates (e.g. `summer_camp_registrations`, `lesson_packages_orders`) stay handled by the existing webhooks; the new function is the central place where the order row transitions to `paid`/`canceled`/`failed`.

Inside `camp-stripe-webhook` and `essa-stripe-webhook` (already wired), look up the order by `metadata.payment_order_id` from the Stripe session and call `finalize_payment_order`.

### Step 6 — Admin payments dashboard scope expansion

`/admin/payments` already lists `payment_orders`. Add a `product_type` filter chip row so admins can triage `summer_camp`, `certification`, `lesson_package`, `program`, `bundle` separately. (Single component update.)

### Step 7 — Remove conflicting / duplicated code

Only delete after the migrations above are live and verified:
- The bespoke duplicate-detection block inside `create-payment` (if any).
- Inline ad-hoc error toasts in callers that conflict with `invokeCheckout()`'s sanitized messages.

Subscriptions, payouts, the ESSA facility function body, and the locked legacy WebRTC/Course Access systems are **not** touched.

## What stays untouched

- `create-checkout` (subscriptions)
- `process-coach-payout`
- ESSA facility business logic
- Legacy WebRTC, Course Access, baseball booking systems (per project memory)

## Risk controls

- Each migrated function keeps the same request signature so existing callers continue to work during the transition.
- Old behavior remains until each caller is switched, one PR per area: `useProductCheckout` → `LessonPackages` → `Certifications` → `useEssaCheckout`.
- Webhooks remain backward-compatible: if `metadata.payment_order_id` is missing they behave exactly as today.

## Verification

For each migrated path:
1. Trigger a successful Stripe test checkout → `payment_orders.status` flips to `paid`.
2. Force a Stripe error (bad `priceId`) → `payment_orders.status` = `checkout_failed`, registration row exists in `pending_followup`, friendly toast shown, no raw Stripe URL leaked.
3. Click submit twice quickly with same `idempotency_key` → only one order row is created.

Approve this scope and I'll implement Steps 1–4 first, then wire webhooks and the dashboard filter in a follow-up message.