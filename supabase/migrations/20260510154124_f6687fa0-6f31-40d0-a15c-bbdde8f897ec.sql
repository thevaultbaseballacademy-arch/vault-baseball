ALTER TABLE public.summer_camp_registrations
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS amount_cents INTEGER,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_summer_camp_registrations_stripe_session
  ON public.summer_camp_registrations(stripe_session_id);