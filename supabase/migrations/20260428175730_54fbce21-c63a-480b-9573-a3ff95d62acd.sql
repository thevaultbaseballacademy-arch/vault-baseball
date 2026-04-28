
ALTER TABLE public.tryout_registrations
  ADD COLUMN IF NOT EXISTS cancel_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tryout_registrations_cancel_token
  ON public.tryout_registrations(cancel_token);
