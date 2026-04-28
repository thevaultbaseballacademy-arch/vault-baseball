CREATE TABLE public.tryout_interest (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  parent_name TEXT,
  age_group TEXT,
  notes TEXT,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tryout_interest_email ON public.tryout_interest(email);
CREATE INDEX idx_tryout_interest_age_group ON public.tryout_interest(age_group);

ALTER TABLE public.tryout_interest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can express interest"
ON public.tryout_interest FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view interest list"
ON public.tryout_interest FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update interest records"
ON public.tryout_interest FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));