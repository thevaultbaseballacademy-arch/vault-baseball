# Stripe Checkout Pattern (Vault OS)

Reference for any new paid product. Source of truth: `create-facility-checkout` + `essa-stripe-webhook`.

## Checkout (one-time payment)

- Function: `create-facility-checkout/index.ts`
- Reject `pk_*` keys early.
- Whitelist allowed price IDs in a `Set<string>` — never trust client-passed IDs.
- Authenticate via `supabase.auth.getUser(token)` from `Authorization: Bearer …`.
- Reuse Stripe customer by email lookup; fall back to `customer_email`.
- `mode: "payment"`.
- `success_url`: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&source=<source>`
- `cancel_url`: `${origin}/<product>?canceled=1`
- **`metadata` MUST include**: `user_id`, `source: "<product>"`, `price_id`, plus any product-specific routing (e.g. `registration_id`).

## Webhook

- Function: `essa-stripe-webhook/index.ts`
- Verify signature via `stripe.webhooks.constructEventAsync` with `STRIPE_WEBHOOK_SECRET`.
- Filter by `event.type === "checkout.session.completed"`.
- Filter by `session.metadata.source === "<product>"` — ignore others.
- Idempotency: write to a table with `stripe_session_id UNIQUE` and check before fulfilling.
- Use `SUPABASE_SERVICE_ROLE_KEY` client (bypasses RLS).
- **Await all email sends** (see register-for-tryout fix — never `EdgeRuntime.waitUntil`).

## Required secrets

- `STRIPE_SECRET_KEY` ✅ configured
- `STRIPE_WEBHOOK_SECRET` ⚠️ **NOT configured as of 2026-05-05** — must be added before any new webhook can fulfill.

## Stripe Dashboard config (per webhook)

- Endpoint: `https://<project>.functions.supabase.co/<webhook-name>`
- Events: `checkout.session.completed`, `checkout.session.expired`
- Copy signing secret → `STRIPE_WEBHOOK_SECRET` (or per-product variant).

## Audit findings (2026-05-05)

- `essa_package_purchases` table is empty — Stripe pattern is **coded** but **never verified live in production**. Camps build inherits this risk; Day 5 verification must include a real test-card end-to-end run.
