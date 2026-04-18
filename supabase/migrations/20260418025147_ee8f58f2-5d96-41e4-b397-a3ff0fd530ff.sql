-- 1) Tag ESSA credits so we can show them separately
ALTER TABLE public.lesson_credits
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'remote';

-- 2) Idempotent ledger of Stripe-fulfilled ESSA package purchases
CREATE TABLE IF NOT EXISTS public.essa_package_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_session_id text NOT NULL UNIQUE,
  stripe_price_id text NOT NULL,
  package_id text NOT NULL,
  lesson_count integer NOT NULL,
  amount_cents integer NOT NULL,
  credit_id uuid REFERENCES public.lesson_credits(id) ON DELETE SET NULL,
  fulfilled_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.essa_package_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own essa purchases"
  ON public.essa_package_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Inserts only happen via service role (webhook); no insert policy needed.

-- 3) Let athletes view their own future ESSA bookings + create new ones
CREATE POLICY "Users view own ESSA reservations"
  ON public.facility_reservations FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR is_owner(auth.uid())
    OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Users create own ESSA reservations"
  ON public.facility_reservations FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND starts_at > now()
    AND status IN ('confirmed','pending')
    AND notes LIKE 'ESSA:%'
  );

-- Index for "my bookings" queries
CREATE INDEX IF NOT EXISTS idx_facility_reservations_created_by
  ON public.facility_reservations(created_by, starts_at DESC);
