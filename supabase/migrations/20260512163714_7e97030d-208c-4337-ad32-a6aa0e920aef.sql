ALTER TABLE public.payment_orders
  DROP CONSTRAINT IF EXISTS payment_orders_status_check;

ALTER TABLE public.payment_orders
  ADD COLUMN IF NOT EXISTS product_key TEXT,
  ADD COLUMN IF NOT EXISTS checkout_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checkout_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS checkout_last_error TEXT,
  ADD COLUMN IF NOT EXISTS follow_up_required BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS follow_up_reason TEXT,
  ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_retried_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ;

ALTER TABLE public.payment_orders
  ADD CONSTRAINT payment_orders_status_check
  CHECK (status IN ('pending','pending_bank_transfer','checkout_failed','pending_followup','paid','failed','canceled'));

CREATE INDEX IF NOT EXISTS idx_payment_orders_follow_up_required
  ON public.payment_orders(follow_up_required)
  WHERE follow_up_required = true;

CREATE INDEX IF NOT EXISTS idx_payment_orders_product_key
  ON public.payment_orders(product_key);

CREATE INDEX IF NOT EXISTS idx_payment_orders_created_status
  ON public.payment_orders(created_at DESC, status);

CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.payment_orders(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  stage TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_order_created
  ON public.payment_events(order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_payment_events_stage_created
  ON public.payment_events(stage, created_at DESC);

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view payment events" ON public.payment_events;
CREATE POLICY "Admins view payment events"
ON public.payment_events FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Service role inserts payment events" ON public.payment_events;
CREATE POLICY "Service role inserts payment events"
ON public.payment_events FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS idx_summer_camp_registrations_lookup
  ON public.summer_camp_registrations(parent_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_summer_camp_registrations_status
  ON public.summer_camp_registrations(status);

CREATE INDEX IF NOT EXISTS idx_summer_camp_registrations_status_email_created
  ON public.summer_camp_registrations(status, parent_email, created_at DESC);

CREATE OR REPLACE FUNCTION public.finalize_summer_camp_payment_order(
  p_order_id UUID,
  p_status TEXT,
  p_stripe_session_id TEXT DEFAULT NULL,
  p_stripe_payment_intent_id TEXT DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS TABLE(order_id UUID, registration_id UUID, order_status TEXT, registration_status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.payment_orders%ROWTYPE;
  v_registration_id UUID;
  v_registration_status TEXT;
  v_now TIMESTAMPTZ := now();
BEGIN
  SELECT * INTO v_order
  FROM public.payment_orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment order not found';
  END IF;

  IF p_status NOT IN ('paid', 'failed', 'canceled', 'checkout_failed', 'pending_followup') THEN
    RAISE EXCEPTION 'Unsupported payment status %', p_status;
  END IF;

  v_registration_id := v_order.product_id;

  UPDATE public.payment_orders
  SET status = p_status,
      stripe_session_id = COALESCE(p_stripe_session_id, stripe_session_id),
      stripe_payment_intent_id = COALESCE(p_stripe_payment_intent_id, stripe_payment_intent_id),
      checkout_completed_at = CASE WHEN p_status = 'paid' THEN COALESCE(checkout_completed_at, v_now) ELSE checkout_completed_at END,
      checkout_last_error = CASE WHEN p_status IN ('failed', 'checkout_failed', 'pending_followup') THEN p_reason ELSE NULL END,
      follow_up_required = CASE WHEN p_status IN ('checkout_failed', 'pending_followup') THEN true ELSE false END,
      follow_up_reason = CASE WHEN p_status IN ('checkout_failed', 'pending_followup') THEN COALESCE(p_reason, follow_up_reason) ELSE NULL END,
      canceled_at = CASE WHEN p_status = 'canceled' THEN COALESCE(canceled_at, v_now) ELSE canceled_at END,
      confirmed_at = CASE WHEN p_status = 'paid' THEN COALESCE(confirmed_at, v_now) ELSE confirmed_at END,
      updated_at = v_now
  WHERE id = p_order_id;

  IF v_registration_id IS NOT NULL THEN
    UPDATE public.summer_camp_registrations
    SET status = CASE
          WHEN p_status = 'paid' THEN 'confirmed'
          WHEN p_status = 'canceled' THEN 'canceled'
          WHEN p_status = 'failed' THEN 'payment_failed'
          WHEN p_status = 'checkout_failed' THEN 'checkout_failed'
          WHEN p_status = 'pending_followup' THEN 'pending_followup'
          ELSE status
        END,
        stripe_session_id = COALESCE(p_stripe_session_id, stripe_session_id),
        paid_at = CASE WHEN p_status = 'paid' THEN COALESCE(paid_at, v_now) ELSE paid_at END,
        updated_at = v_now
    WHERE id = v_registration_id
    RETURNING status INTO v_registration_status;
  END IF;

  RETURN QUERY SELECT p_order_id, v_registration_id, p_status, v_registration_status;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_payment_order_retry(
  p_order_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS public.payment_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.payment_orders%ROWTYPE;
BEGIN
  UPDATE public.payment_orders
  SET retry_count = retry_count + 1,
      last_retried_at = now(),
      checkout_last_error = COALESCE(p_reason, checkout_last_error),
      updated_at = now()
  WHERE id = p_order_id
  RETURNING * INTO v_order;

  RETURN v_order;
END;
$$;