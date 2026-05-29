
CREATE TABLE public.team_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_level TEXT NOT NULL,
  tier TEXT NOT NULL,
  annual_tuition_cents INTEGER NOT NULL,

  payment_plan TEXT NOT NULL CHECK (payment_plan IN ('full', 'installments')),
  deposit_cents INTEGER NOT NULL DEFAULT 0,
  installment_count INTEGER NOT NULL DEFAULT 0,
  installment_cents INTEGER NOT NULL DEFAULT 0,

  player_first_name TEXT NOT NULL,
  player_last_name TEXT NOT NULL,
  player_dob DATE,
  player_position TEXT,

  parent_first_name TEXT NOT NULL,
  parent_last_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','canceled')),
  amount_paid_cents INTEGER NOT NULL DEFAULT 0,
  stripe_session_id TEXT UNIQUE,
  paid_at TIMESTAMPTZ,

  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.team_registrations TO authenticated;
GRANT ALL ON public.team_registrations TO service_role;

ALTER TABLE public.team_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view team registrations"
ON public.team_registrations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_team_registrations_updated_at
BEFORE UPDATE ON public.team_registrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_team_registrations_status ON public.team_registrations(status);
CREATE INDEX idx_team_registrations_created_at ON public.team_registrations(created_at DESC);
CREATE INDEX idx_team_registrations_team_level ON public.team_registrations(team_level);
