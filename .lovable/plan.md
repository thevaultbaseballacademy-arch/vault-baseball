# Reusable Payment Architecture: Card + Bank Transfer

## Goal
Add a second payment path (bank transfer) alongside the existing Stripe Checkout flow, built as a reusable module so any paid VAULT product (summer camp, programs, bundles, lessons) can plug in without touching existing Stripe logic.

## Architecture Overview

```text
                    ┌─────────────────────────────┐
                    │  Product page (e.g. Camp)   │
                    │  <PaymentMethodSelector />  │
                    └──────────────┬──────────────┘
                                   │
                ┌──────────────────┴──────────────────┐
                │                                     │
        Pay by Card (default)                Pay by Bank Transfer
                │                                     │
   create-checkout-session  edge fn        create-pending-order edge fn
   (existing logic, untouched)             (new, shared)
                │                                     │
        Stripe Checkout                    Pending order row +
                │                          instructions screen +
        Stripe webhook                     instructions email
                │                                     │
        order.status = 'paid'              order.status = 'pending_bank_transfer'
                                                      │
                                            Admin "Mark as paid" action
                                                      │
                                             order.status = 'paid'
```

## Data Model

New shared table `payment_orders` (one row per paid product purchase, regardless of method):

- `id`
- `user_id` (nullable for guest)
- `product_type` (`summer_camp`, `program`, `bundle`, `lesson`, …)
- `product_id` (FK / reference into the originating record, e.g. summer camp registration id)
- `amount_cents`, `currency`
- `payment_method` (`card` | `bank_transfer`)
- `status` (`pending` | `pending_bank_transfer` | `paid` | `failed` | `canceled`)
- `stripe_session_id` (nullable)
- `stripe_payment_intent_id` (nullable)
- `confirmed_by` (admin user_id, nullable) + `confirmed_at`
- `customer_email`, `customer_name`, `metadata jsonb`

RLS: users see their own orders; admins see all; service role writes from edge functions.

`summer_camp_registrations` gets a nullable `payment_order_id` link so existing data stays intact.

## Edge Functions

1. `create-checkout-session` (existing summer-camp function stays as-is for card path; will be generalized later but not changed in this pass).
2. `create-pending-order` (new, shared) — creates a `payment_orders` row with status `pending_bank_transfer`, sends instructions email via the existing email queue, returns the order id + instructions payload.
3. `admin-confirm-bank-transfer` (new) — admin-only; flips status to `paid`, stamps `confirmed_by`/`confirmed_at`, triggers the same downstream effects the Stripe webhook triggers (mark camp registration paid, send receipt).
4. Stripe webhook (existing) — also writes the `paid` status into `payment_orders` keyed by `stripe_session_id`.

## Frontend

- `<PaymentMethodSelector />` — reusable component:
  - Two cards: **Pay by Card** (primary, "Instant secure checkout") and **Pay by Bank Transfer** (secondary, "Reserve your spot, pay within X days").
  - Mobile-first, single column on small screens.
  - Accepts `productType`, `productId`, `amountCents`, `customer` props and a `onCardCheckout` / `onBankTransfer` pair, so each product page wires its own card-session creator.
- `/payment/bank-instructions/:orderId` — branded instructions page (account name, bank, account #, routing/IBAN, reference = order id, amount, deadline, support contact). Shown after bank transfer is chosen and also linked from the email.
- Status chips on the user's registration view: **Reserved – awaiting bank transfer**, **Pending review**, **Confirmed**.
- Existing success / cancel pages reused for card flow; new pending page for bank flow.

## Admin

- New page `/admin/payments` (admin-only via existing role check):
  - Filter by status (`pending_bank_transfer` by default), product type, date.
  - Row actions: **Mark as paid**, **Cancel**, **View details**.
  - "Mark as paid" calls `admin-confirm-bank-transfer`.
- Reuses existing admin layout / auth guard, no redesign.

## Bank Account Details
Stored as project secrets (`BANK_TRANSFER_INSTRUCTIONS_JSON`) so they can be updated without code changes and never live in the repo. The instructions page and email pull from a single edge-function-served config endpoint.

## Rollout in this PR
1. Migration: `payment_orders` table + RLS + link column on summer camp registrations.
2. Edge functions: `create-pending-order`, `admin-confirm-bank-transfer`; small webhook patch to upsert into `payment_orders`.
3. UI: `<PaymentMethodSelector />`, bank instructions page, pending status on the camp confirmation screen.
4. Wire selector into **Summer Camp registration** only (other products keep current flow; selector is drop-in for the next pass).
5. Admin payments page with bank-transfer queue + manual confirm.
6. Email template for bank transfer instructions (uses existing email queue).

## Out of Scope (intentional)
- No changes to existing card checkout logic, retry behavior, or the recent `register-summer-camp` fixes.
- No redesign of the camp page — only the payment step gets the selector.
- Other paid products will adopt the selector in follow-up passes.

## Secrets Needed
- `BANK_TRANSFER_INSTRUCTIONS_JSON` — JSON blob with: `account_name`, `bank_name`, `account_number`, `routing_number` (or IBAN/SWIFT), `reference_prefix`, `payment_deadline_days`, `support_email`. You'll provide values; I'll add the secret before deploying.

Confirm and I'll implement in this order: migration → edge functions → selector + bank pages → admin queue → wire into Summer Camp.