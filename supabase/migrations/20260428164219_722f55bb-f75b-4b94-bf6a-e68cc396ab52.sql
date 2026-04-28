-- Tryout events table
CREATE TABLE public.tryout_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('9-12', '13-17')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  location_name TEXT NOT NULL,
  address TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  capacity INTEGER NOT NULL DEFAULT 20,
  waitlist_capacity INTEGER NOT NULL DEFAULT 10,
  description TEXT,
  what_to_bring TEXT,
  waiver_text TEXT NOT NULL DEFAULT 'I acknowledge that baseball activities carry inherent risks of injury. I voluntarily assume all risks associated with participation, and release 22M Baseball, its coaches, and affiliates from any liability for injury or loss arising from this event.',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  coach_ids UUID[] DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tryout_events_status_starts ON public.tryout_events(status, starts_at);

ALTER TABLE public.tryout_events ENABLE ROW LEVEL SECURITY;

-- Public can view published, future events
CREATE POLICY "Public can view published upcoming tryouts"
ON public.tryout_events FOR SELECT
USING (status = 'published' AND starts_at > now());

-- Admins/owners can do everything
CREATE POLICY "Admins manage all tryouts"
ON public.tryout_events FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.is_owner(auth.uid()))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_owner(auth.uid()));

-- Coaches can view tryouts they're assigned to
CREATE POLICY "Coaches view assigned tryouts"
ON public.tryout_events FOR SELECT
USING (auth.uid() = ANY(coach_ids));

CREATE TRIGGER update_tryout_events_updated_at
BEFORE UPDATE ON public.tryout_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- Tryout registrations table
CREATE TABLE public.tryout_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.tryout_events(id) ON DELETE CASCADE,
  -- Player info (denormalized snapshot at registration time)
  player_first_name TEXT NOT NULL,
  player_last_name TEXT NOT NULL,
  player_dob DATE NOT NULL,
  player_throwing_hand TEXT CHECK (player_throwing_hand IN ('Right', 'Left')),
  player_position TEXT,
  player_current_team TEXT,
  player_experience TEXT,
  -- Parent info
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  -- Emergency
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  emergency_relationship TEXT NOT NULL,
  -- Medical
  medical_notes TEXT,
  -- Consent
  photo_release_consent BOOLEAN NOT NULL DEFAULT false,
  waiver_signature_name TEXT NOT NULL,
  waiver_signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  waiver_ip TEXT,
  -- Status / payment
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'waitlisted', 'cancelled')),
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tryout_registrations_event ON public.tryout_registrations(event_id);
CREATE INDEX idx_tryout_registrations_email ON public.tryout_registrations(parent_email);
CREATE INDEX idx_tryout_registrations_status ON public.tryout_registrations(event_id, status);

ALTER TABLE public.tryout_registrations ENABLE ROW LEVEL SECURITY;

-- No public SELECT, no public INSERT — all writes go through edge function
-- Admins/owners can do everything
CREATE POLICY "Admins manage all registrations"
ON public.tryout_registrations FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.is_owner(auth.uid()))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_owner(auth.uid()));

-- Coaches assigned to the event can view its registrations
CREATE POLICY "Coaches view registrations for assigned tryouts"
ON public.tryout_registrations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tryout_events e
    WHERE e.id = event_id AND auth.uid() = ANY(e.coach_ids)
  )
);

CREATE TRIGGER update_tryout_registrations_updated_at
BEFORE UPDATE ON public.tryout_registrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();