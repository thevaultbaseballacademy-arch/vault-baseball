-- Scheduling OS: additive columns + audit log + blackouts + atomic conflict-check RPC
-- No legacy tables are altered; only additive columns + new tables/funcs.

ALTER TABLE public.facility_reservations
  ADD COLUMN IF NOT EXISTS booking_type text
    CHECK (booking_type IS NULL OR booking_type IN
      ('in_person_lesson','remote_lesson','evaluation','personal_training','facility_reservation','blackout')),
  ADD COLUMN IF NOT EXISTS buffer_before_min int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS buffer_after_min int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS internal_notes text,
  ADD COLUMN IF NOT EXISTS client_user_id uuid;

CREATE INDEX IF NOT EXISTS idx_facility_reservations_starts_at
  ON public.facility_reservations (starts_at);
CREATE INDEX IF NOT EXISTS idx_facility_reservations_coach_starts
  ON public.facility_reservations (coach_user_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_facility_reservations_space_starts
  ON public.facility_reservations (space_id, starts_at);

-- Coach blackout windows (vacations / time-off)
CREATE TABLE IF NOT EXISTS public.coach_blackouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_user_id uuid NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
CREATE INDEX IF NOT EXISTS idx_coach_blackouts_coach ON public.coach_blackouts (coach_user_id, starts_at);
ALTER TABLE public.coach_blackouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff read coach_blackouts" ON public.coach_blackouts;
CREATE POLICY "staff read coach_blackouts" ON public.coach_blackouts
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(),'admin') OR is_owner(auth.uid())
    OR coach_user_id = auth.uid()
  );

DROP POLICY IF EXISTS "admins manage coach_blackouts" ON public.coach_blackouts;
CREATE POLICY "admins manage coach_blackouts" ON public.coach_blackouts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin') OR is_owner(auth.uid()))
  WITH CHECK (has_role(auth.uid(),'admin') OR is_owner(auth.uid()));

DROP POLICY IF EXISTS "coach inserts own blackout" ON public.coach_blackouts;
CREATE POLICY "coach inserts own blackout" ON public.coach_blackouts
  FOR INSERT TO authenticated
  WITH CHECK (coach_user_id = auth.uid());

-- Audit log for every scheduling mutation
CREATE TABLE IF NOT EXISTS public.scheduling_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid,
  action text NOT NULL,         -- create | update | cancel | reassign | blackout
  actor_user_id uuid,
  actor_role text,
  before_data jsonb,
  after_data jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sched_audit_reservation ON public.scheduling_audit_log (reservation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sched_audit_actor ON public.scheduling_audit_log (actor_user_id, created_at DESC);
ALTER TABLE public.scheduling_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read audit log" ON public.scheduling_audit_log;
CREATE POLICY "admins read audit log" ON public.scheduling_audit_log
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR is_owner(auth.uid()));

-- Inserts only via SECURITY DEFINER functions (no direct INSERT policy needed),
-- but allow service_role/admins to insert if needed.
DROP POLICY IF EXISTS "admins insert audit log" ON public.scheduling_audit_log;
CREATE POLICY "admins insert audit log" ON public.scheduling_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin') OR is_owner(auth.uid()));

-- Atomic conflict-check + lock function used by scheduling-mutate edge function.
-- Returns conflict info (or NULL row if free). Uses SELECT ... FOR UPDATE on the
-- candidate window so concurrent calls serialize.
CREATE OR REPLACE FUNCTION public.lock_facility_reservation_window(
  p_space_id uuid,
  p_coach_user_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_buffer_before_min int DEFAULT 0,
  p_buffer_after_min int DEFAULT 0,
  p_exclude_reservation_id uuid DEFAULT NULL
)
RETURNS TABLE (
  conflict_kind text,         -- 'space' | 'coach' | 'blackout' | NULL
  conflicting_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start timestamptz := p_starts_at - make_interval(mins => COALESCE(p_buffer_before_min,0));
  v_end   timestamptz := p_ends_at + make_interval(mins => COALESCE(p_buffer_after_min,0));
  v_id uuid;
BEGIN
  -- Space conflict
  IF p_space_id IS NOT NULL THEN
    SELECT r.id INTO v_id
    FROM public.facility_reservations r
    WHERE r.space_id = p_space_id
      AND r.status IN ('pending','confirmed')
      AND (p_exclude_reservation_id IS NULL OR r.id <> p_exclude_reservation_id)
      AND tstzrange(
            r.starts_at - make_interval(mins => COALESCE(r.buffer_before_min,0)),
            r.ends_at + make_interval(mins => COALESCE(r.buffer_after_min,0)),
            '[)'
          ) && tstzrange(v_start, v_end, '[)')
    FOR UPDATE
    LIMIT 1;
    IF v_id IS NOT NULL THEN
      RETURN QUERY SELECT 'space'::text, v_id; RETURN;
    END IF;
  END IF;

  -- Coach conflict (any space)
  IF p_coach_user_id IS NOT NULL THEN
    SELECT r.id INTO v_id
    FROM public.facility_reservations r
    WHERE r.coach_user_id = p_coach_user_id
      AND r.status IN ('pending','confirmed')
      AND (p_exclude_reservation_id IS NULL OR r.id <> p_exclude_reservation_id)
      AND tstzrange(
            r.starts_at - make_interval(mins => COALESCE(r.buffer_before_min,0)),
            r.ends_at + make_interval(mins => COALESCE(r.buffer_after_min,0)),
            '[)'
          ) && tstzrange(v_start, v_end, '[)')
    FOR UPDATE
    LIMIT 1;
    IF v_id IS NOT NULL THEN
      RETURN QUERY SELECT 'coach'::text, v_id; RETURN;
    END IF;

    -- Blackout window
    SELECT b.id INTO v_id
    FROM public.coach_blackouts b
    WHERE b.coach_user_id = p_coach_user_id
      AND tstzrange(b.starts_at, b.ends_at, '[)') && tstzrange(v_start, v_end, '[)')
    LIMIT 1;
    IF v_id IS NOT NULL THEN
      RETURN QUERY SELECT 'blackout'::text, v_id; RETURN;
    END IF;
  END IF;

  RETURN; -- no conflict
END;
$$;

REVOKE ALL ON FUNCTION public.lock_facility_reservation_window(uuid,uuid,timestamptz,timestamptz,int,int,uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.lock_facility_reservation_window(uuid,uuid,timestamptz,timestamptz,int,int,uuid) TO authenticated, service_role;