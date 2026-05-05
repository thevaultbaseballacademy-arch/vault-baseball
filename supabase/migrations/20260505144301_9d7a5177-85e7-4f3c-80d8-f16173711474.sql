
-- ============================================================================
-- CAMPS PRODUCT — Day 1 schema
-- ============================================================================

-- ===== CAMPS =====
CREATE TABLE public.camps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,

  weekly_price_cents INTEGER NOT NULL CHECK (weekly_price_cents >= 0),
  full_pass_price_cents INTEGER NOT NULL CHECK (full_pass_price_cents >= 0),
  full_pass_savings_cents INTEGER GENERATED ALWAYS AS
    ((weekly_price_cents * 4) - full_pass_price_cents) STORED,

  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  registration_opens_at TIMESTAMPTZ,
  registration_closes_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== COHORTS (age group + venue) =====
CREATE TABLE public.camp_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id UUID NOT NULL REFERENCES public.camps(id) ON DELETE CASCADE,

  age_min INTEGER NOT NULL,
  age_max INTEGER NOT NULL,
  age_label TEXT NOT NULL,

  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  venue_city TEXT NOT NULL,
  venue_state TEXT NOT NULL,
  venue_zip TEXT NOT NULL,

  daily_start_time TIME NOT NULL,
  daily_end_time TIME NOT NULL,

  display_order INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (age_min <= age_max),
  CHECK (daily_start_time < daily_end_time)
);

-- ===== WEEKLY SESSIONS =====
CREATE TABLE public.camp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID NOT NULL REFERENCES public.camp_cohorts(id) ON DELETE CASCADE,

  session_number INTEGER NOT NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,

  capacity INTEGER NOT NULL DEFAULT 30 CHECK (capacity >= 0),
  waitlist_capacity INTEGER NOT NULL DEFAULT 5 CHECK (waitlist_capacity >= 0),

  status TEXT NOT NULL CHECK (status IN ('open', 'closed', 'cancelled')) DEFAULT 'open',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (cohort_id, session_number),
  CHECK (starts_on <= ends_on)
);

-- ===== REGISTRATIONS =====
CREATE TABLE public.camp_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id UUID NOT NULL REFERENCES public.camps(id),
  cohort_id UUID NOT NULL REFERENCES public.camp_cohorts(id),

  player_first_name TEXT NOT NULL,
  player_last_name TEXT NOT NULL,
  player_dob DATE NOT NULL,
  player_age_at_registration INTEGER NOT NULL,

  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  parent_phone TEXT NOT NULL,

  emergency_contact_name TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  emergency_contact_relationship TEXT NOT NULL,

  medical_notes TEXT,

  waiver_signature_name TEXT NOT NULL,
  waiver_signed_at TIMESTAMPTZ NOT NULL,
  waiver_ip TEXT,
  photo_release_consent BOOLEAN NOT NULL DEFAULT false,

  registration_type TEXT NOT NULL CHECK (registration_type IN ('weekly', 'full_pass')),

  amount_paid_cents INTEGER NOT NULL CHECK (amount_paid_cents >= 0),

  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,

  status TEXT NOT NULL CHECK (status IN (
    'pending_payment', 'confirmed', 'cancelled', 'refunded'
  )) DEFAULT 'pending_payment',

  cancel_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- ===== JOIN: registration ↔ sessions =====
CREATE TABLE public.camp_registration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.camp_registrations(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.camp_sessions(id),

  status TEXT NOT NULL CHECK (status IN ('reserved', 'cancelled')) DEFAULT 'reserved',

  reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (registration_id, session_id)
);

-- ===== INDEXES =====
CREATE INDEX idx_camp_cohorts_camp ON public.camp_cohorts(camp_id);
CREATE INDEX idx_camp_sessions_cohort ON public.camp_sessions(cohort_id);
CREATE INDEX idx_camp_registrations_camp ON public.camp_registrations(camp_id);
CREATE INDEX idx_camp_registrations_cohort ON public.camp_registrations(cohort_id);
CREATE INDEX idx_camp_registrations_status ON public.camp_registrations(status);
CREATE INDEX idx_camp_registrations_email ON public.camp_registrations(parent_email);
CREATE INDEX idx_camp_reg_sessions_session ON public.camp_registration_sessions(session_id);
CREATE INDEX idx_camp_reg_sessions_registration ON public.camp_registration_sessions(registration_id);

-- ===== updated_at triggers =====
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_camps_updated_at BEFORE UPDATE ON public.camps
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_camp_cohorts_updated_at BEFORE UPDATE ON public.camp_cohorts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_camp_sessions_updated_at BEFORE UPDATE ON public.camp_sessions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============================================================================
-- ATOMIC CAPACITY-CHECK + INSERT RPC
-- ============================================================================
CREATE OR REPLACE FUNCTION public.create_camp_registration_atomic(
  p_camp_id UUID,
  p_cohort_id UUID,
  p_session_ids UUID[],
  p_registration_type TEXT,
  p_amount_paid_cents INTEGER,
  p_player_first_name TEXT,
  p_player_last_name TEXT,
  p_player_dob DATE,
  p_player_age_at_registration INTEGER,
  p_parent_name TEXT,
  p_parent_email TEXT,
  p_parent_phone TEXT,
  p_emergency_contact_name TEXT,
  p_emergency_contact_phone TEXT,
  p_emergency_contact_relationship TEXT,
  p_medical_notes TEXT,
  p_waiver_signature_name TEXT,
  p_waiver_ip TEXT,
  p_photo_release_consent BOOLEAN
)
RETURNS TABLE (registration_id UUID, conflict_code TEXT, conflict_session_id UUID)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_session_id UUID;
  v_capacity INTEGER;
  v_used INTEGER;
  v_new_id UUID;
  v_camp_status TEXT;
  v_cohort_camp UUID;
  v_age_min INTEGER;
  v_age_max INTEGER;
BEGIN
  -- Validate camp is published and registration window open
  SELECT status INTO v_camp_status FROM camps WHERE id = p_camp_id FOR SHARE;
  IF v_camp_status IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, 'CAMP_NOT_FOUND'::TEXT, NULL::UUID; RETURN;
  END IF;
  IF v_camp_status <> 'published' THEN
    RETURN QUERY SELECT NULL::UUID, 'CAMP_NOT_PUBLISHED'::TEXT, NULL::UUID; RETURN;
  END IF;

  -- Validate cohort belongs to camp + age fits
  SELECT camp_id, age_min, age_max INTO v_cohort_camp, v_age_min, v_age_max
  FROM camp_cohorts WHERE id = p_cohort_id;
  IF v_cohort_camp IS NULL OR v_cohort_camp <> p_camp_id THEN
    RETURN QUERY SELECT NULL::UUID, 'COHORT_INVALID'::TEXT, NULL::UUID; RETURN;
  END IF;
  IF p_player_age_at_registration < v_age_min OR p_player_age_at_registration > v_age_max THEN
    RETURN QUERY SELECT NULL::UUID, 'AGE_OUT_OF_RANGE'::TEXT, NULL::UUID; RETURN;
  END IF;

  -- Lock involved sessions
  PERFORM 1 FROM camp_sessions
  WHERE id = ANY(p_session_ids) AND cohort_id = p_cohort_id
  FOR UPDATE;

  -- Validate count + that all sessions belong to cohort + are open + capacity
  FOREACH v_session_id IN ARRAY p_session_ids LOOP
    SELECT capacity INTO v_capacity
    FROM camp_sessions
    WHERE id = v_session_id AND cohort_id = p_cohort_id AND status = 'open';
    IF v_capacity IS NULL THEN
      RETURN QUERY SELECT NULL::UUID, 'SESSION_NOT_OPEN'::TEXT, v_session_id; RETURN;
    END IF;

    SELECT COUNT(*) INTO v_used
    FROM camp_registration_sessions crs
    JOIN camp_registrations cr ON cr.id = crs.registration_id
    WHERE crs.session_id = v_session_id
      AND crs.status = 'reserved'
      AND cr.status IN ('pending_payment', 'confirmed');

    IF v_used >= v_capacity THEN
      RETURN QUERY SELECT NULL::UUID, 'SESSION_FULL'::TEXT, v_session_id; RETURN;
    END IF;
  END LOOP;

  -- Insert registration
  INSERT INTO camp_registrations (
    camp_id, cohort_id,
    player_first_name, player_last_name, player_dob, player_age_at_registration,
    parent_name, parent_email, parent_phone,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
    medical_notes,
    waiver_signature_name, waiver_signed_at, waiver_ip, photo_release_consent,
    registration_type, amount_paid_cents,
    status
  ) VALUES (
    p_camp_id, p_cohort_id,
    p_player_first_name, p_player_last_name, p_player_dob, p_player_age_at_registration,
    p_parent_name, p_parent_email, p_parent_phone,
    p_emergency_contact_name, p_emergency_contact_phone, p_emergency_contact_relationship,
    p_medical_notes,
    p_waiver_signature_name, NOW(), p_waiver_ip, p_photo_release_consent,
    p_registration_type, p_amount_paid_cents,
    'pending_payment'
  )
  RETURNING id INTO v_new_id;

  -- Insert session links
  FOREACH v_session_id IN ARRAY p_session_ids LOOP
    INSERT INTO camp_registration_sessions (registration_id, session_id)
    VALUES (v_new_id, v_session_id);
  END LOOP;

  RETURN QUERY SELECT v_new_id, NULL::TEXT, NULL::UUID;
END;
$$;

REVOKE ALL ON FUNCTION public.create_camp_registration_atomic FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_camp_registration_atomic TO service_role;

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE public.camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_registration_sessions ENABLE ROW LEVEL SECURITY;

-- Public read of published camps
CREATE POLICY "Public can view published camps"
  ON public.camps FOR SELECT TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admins manage camps"
  ON public.camps FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Cohorts of published camps
CREATE POLICY "Public can view cohorts of published camps"
  ON public.camp_cohorts FOR SELECT TO anon, authenticated
  USING (camp_id IN (SELECT id FROM public.camps WHERE status = 'published'));

CREATE POLICY "Admins manage cohorts"
  ON public.camp_cohorts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Sessions of published camps
CREATE POLICY "Public can view open sessions of published camps"
  ON public.camp_sessions FOR SELECT TO anon, authenticated
  USING (
    cohort_id IN (
      SELECT cc.id FROM public.camp_cohorts cc
      JOIN public.camps c ON c.id = cc.camp_id
      WHERE c.status = 'published'
    )
  );

CREATE POLICY "Admins manage sessions"
  ON public.camp_sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Registrations: admin-only direct access; edge functions use service role
CREATE POLICY "Admins manage registrations"
  ON public.camp_registrations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage registration sessions"
  ON public.camp_registration_sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- VIEW TRACKING (Section 6)
-- ============================================================================
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  page_category TEXT NOT NULL,
  session_id UUID NOT NULL,
  referrer TEXT,
  user_agent_summary TEXT,
  funnel_event TEXT,
  related_entity_id UUID,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_page_views_path ON public.page_views(page_path);
CREATE INDEX idx_page_views_category ON public.page_views(page_category);
CREATE INDEX idx_page_views_session ON public.page_views(session_id);
CREATE INDEX idx_page_views_event ON public.page_views(funnel_event);
CREATE INDEX idx_page_views_viewed_at ON public.page_views(viewed_at DESC);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert page views"
  ON public.page_views FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all page views"
  ON public.page_views FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================================================================
-- SEED — 22M Elite Summer Development Camp (DRAFT until addresses confirmed)
-- ============================================================================
DO $$
DECLARE
  v_camp_id UUID;
  v_cohort_younger_id UUID;
  v_cohort_older_id UUID;
BEGIN
  INSERT INTO public.camps (
    name, description,
    weekly_price_cents, full_pass_price_cents,
    status, registration_opens_at, registration_closes_at
  )
  VALUES (
    '22M Elite Summer Development Camp',
    'Build skills. Build confidence. Be elite. Four weeks of intensive baseball development covering hitting, pitching, fielding, and game IQ.',
    25000, 100000,
    'draft', NOW(), '2026-06-28 23:59:59-04'
  )
  RETURNING id INTO v_camp_id;

  INSERT INTO public.camp_cohorts (
    camp_id, age_min, age_max, age_label,
    venue_name, venue_address, venue_city, venue_state, venue_zip,
    daily_start_time, daily_end_time, display_order
  ) VALUES (
    v_camp_id, 7, 10, 'Ages 7–10',
    'Ross Field', 'TBD - confirm address', 'Keyport', 'NJ', '07735',
    '09:00', '15:00', 1
  ) RETURNING id INTO v_cohort_younger_id;

  INSERT INTO public.camp_cohorts (
    camp_id, age_min, age_max, age_label,
    venue_name, venue_address, venue_city, venue_state, venue_zip,
    daily_start_time, daily_end_time, display_order
  ) VALUES (
    v_camp_id, 11, 15, 'Ages 11–15',
    'Gravelly Brook Park', 'TBD - confirm address', 'Matawan', 'NJ', '07747',
    '09:00', '15:00', 2
  ) RETURNING id INTO v_cohort_older_id;

  INSERT INTO public.camp_sessions (cohort_id, session_number, starts_on, ends_on, capacity, waitlist_capacity, status) VALUES
    (v_cohort_younger_id, 1, '2026-06-29', '2026-07-02', 30, 5, 'open'),
    (v_cohort_younger_id, 2, '2026-07-06', '2026-07-09', 30, 5, 'open'),
    (v_cohort_younger_id, 3, '2026-07-13', '2026-07-16', 30, 5, 'open'),
    (v_cohort_younger_id, 4, '2026-07-20', '2026-07-24', 30, 5, 'open'),
    (v_cohort_older_id,   1, '2026-06-29', '2026-07-02', 30, 5, 'open'),
    (v_cohort_older_id,   2, '2026-07-06', '2026-07-09', 30, 5, 'open'),
    (v_cohort_older_id,   3, '2026-07-13', '2026-07-16', 30, 5, 'open'),
    (v_cohort_older_id,   4, '2026-07-20', '2026-07-24', 30, 5, 'open');
END $$;
