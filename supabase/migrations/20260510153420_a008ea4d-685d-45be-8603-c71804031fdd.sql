CREATE TABLE public.summer_camp_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_first_name TEXT NOT NULL,
  athlete_last_name TEXT NOT NULL,
  athlete_age INTEGER NOT NULL CHECK (athlete_age >= 4 AND athlete_age <= 25),
  sport TEXT NOT NULL CHECK (sport IN ('baseball','softball')),
  primary_position TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  emergency_contact TEXT NOT NULL,
  medical_notes TEXT,
  tshirt_size TEXT NOT NULL CHECK (tshirt_size IN ('YS','YM','YL','AS','AM','AL','AXL','A2XL')),
  preferred_session TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.summer_camp_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a summer camp registration"
ON public.summer_camp_registrations FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view summer camp registrations"
ON public.summer_camp_registrations FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update summer camp registrations"
ON public.summer_camp_registrations FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete summer camp registrations"
ON public.summer_camp_registrations FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_summer_camp_registrations_updated
BEFORE UPDATE ON public.summer_camp_registrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_summer_camp_registrations_created_at ON public.summer_camp_registrations(created_at DESC);
CREATE INDEX idx_summer_camp_registrations_email ON public.summer_camp_registrations(parent_email);