
-- Payment orders: shared across all paid products
CREATE TABLE public.payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  product_type TEXT NOT NULL,
  product_id UUID,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card','bank_transfer')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','pending_bank_transfer','paid','failed','canceled')),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  customer_email TEXT,
  customer_name TEXT,
  reference_code TEXT UNIQUE,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  confirmed_by UUID,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_orders_status ON public.payment_orders(status);
CREATE INDEX idx_payment_orders_email ON public.payment_orders(customer_email);
CREATE INDEX idx_payment_orders_product ON public.payment_orders(product_type, product_id);
CREATE INDEX idx_payment_orders_stripe_session ON public.payment_orders(stripe_session_id);

-- Auto-generate a short, human-readable reference code (e.g. VLT-AB12CD34)
CREATE OR REPLACE FUNCTION public.generate_payment_order_reference()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.reference_code IS NULL THEN
    NEW.reference_code := 'VLT-' || upper(substring(replace(NEW.id::text, '-', '') from 1 for 8));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_payment_orders_reference
  BEFORE INSERT ON public.payment_orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_payment_order_reference();

CREATE TRIGGER trg_payment_orders_updated
  BEFORE UPDATE ON public.payment_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

-- Users can see their own orders (by user_id or matching email)
CREATE POLICY "Users view own orders"
ON public.payment_orders FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR lower(customer_email) = lower((auth.jwt() ->> 'email'))
);

-- Admins full access
CREATE POLICY "Admins view all orders"
ON public.payment_orders FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update orders"
ON public.payment_orders FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete orders"
ON public.payment_orders FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Link summer camp registrations to orders
ALTER TABLE public.summer_camp_registrations
  ADD COLUMN IF NOT EXISTS payment_order_id UUID REFERENCES public.payment_orders(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Allow new status value for bank transfer pending registrations
ALTER TABLE public.summer_camp_registrations DROP CONSTRAINT IF EXISTS summer_camp_registrations_status_check;
-- (No prior status check existed; we simply expand the implicit set used by code.)

CREATE INDEX IF NOT EXISTS idx_summer_camp_registrations_payment_order
  ON public.summer_camp_registrations(payment_order_id);
