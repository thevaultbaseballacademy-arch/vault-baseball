-- Enable btree_gist so GiST indexes can mix UUID with tstzrange
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1. Resource type enum
DO $$ BEGIN
  CREATE TYPE public.reservation_resource_type AS ENUM ('space', 'coach', 'equipment');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. reservation_resources join table
CREATE TABLE IF NOT EXISTS public.reservation_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID NOT NULL REFERENCES public.facility_reservations(id) ON DELETE CASCADE,
  resource_type public.reservation_resource_type NOT NULL,
  resource_id UUID NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reservation_resources_time_valid CHECK (ends_at > starts_at)
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_reservation_resources_reservation
  ON public.reservation_resources(reservation_id);

CREATE INDEX IF NOT EXISTS idx_reservation_resources_lookup
  ON public.reservation_resources(resource_type, resource_id, status);

CREATE INDEX IF NOT EXISTS idx_reservation_resources_range
  ON public.reservation_resources
  USING GIST (resource_id, tstzrange(starts_at, ends_at, '[)'));

CREATE INDEX IF NOT EXISTS idx_facility_reservations_range
  ON public.facility_reservations
  USING GIST (space_id, tstzrange(starts_at, ends_at, '[)'))
  WHERE status <> 'cancelled';

CREATE INDEX IF NOT EXISTS idx_facility_reservations_coach
  ON public.facility_reservations(coach_user_id, starts_at, ends_at)
  WHERE status <> 'cancelled' AND coach_user_id IS NOT NULL;

-- 4. RLS
ALTER TABLE public.reservation_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and admins manage reservation resources"
  ON public.reservation_resources
  FOR ALL
  TO authenticated
  USING (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Coaches read their own resource rows"
  ON public.reservation_resources
  FOR SELECT
  TO authenticated
  USING (resource_type = 'coach' AND resource_id = auth.uid());

-- 5. create_reservation_atomic
CREATE OR REPLACE FUNCTION public.create_reservation_atomic(
  p_space_id UUID,
  p_coach_user_id UUID,
  p_starts_at TIMESTAMPTZ,
  p_ends_at TIMESTAMPTZ,
  p_title TEXT,
  p_email TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'confirmed'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_reservation_id UUID;
  v_conflicts JSONB := '[]'::jsonb;
  v_space_conflict RECORD;
  v_coach_conflict RECORD;
BEGIN
  IF NOT (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Access denied: owner or admin role required';
  END IF;

  IF p_ends_at <= p_starts_at THEN
    RAISE EXCEPTION 'End time must be after start time';
  END IF;

  PERFORM 1 FROM public.facility_spaces WHERE id = p_space_id FOR UPDATE;

  SELECT id, starts_at, ends_at, title
  INTO v_space_conflict
  FROM public.facility_reservations
  WHERE space_id = p_space_id
    AND status <> 'cancelled'
    AND tstzrange(starts_at, ends_at, '[)') && tstzrange(p_starts_at, p_ends_at, '[)')
  LIMIT 1;

  IF v_space_conflict.id IS NOT NULL THEN
    v_conflicts := v_conflicts || jsonb_build_object(
      'resource_type', 'space',
      'resource_id', p_space_id,
      'conflicting_reservation_id', v_space_conflict.id,
      'conflicting_starts_at', v_space_conflict.starts_at,
      'conflicting_ends_at', v_space_conflict.ends_at,
      'conflicting_title', v_space_conflict.title
    );
  END IF;

  IF p_coach_user_id IS NOT NULL THEN
    SELECT id, starts_at, ends_at, title
    INTO v_coach_conflict
    FROM public.facility_reservations
    WHERE coach_user_id = p_coach_user_id
      AND status <> 'cancelled'
      AND tstzrange(starts_at, ends_at, '[)') && tstzrange(p_starts_at, p_ends_at, '[)')
    LIMIT 1;

    IF v_coach_conflict.id IS NOT NULL THEN
      v_conflicts := v_conflicts || jsonb_build_object(
        'resource_type', 'coach',
        'resource_id', p_coach_user_id,
        'conflicting_reservation_id', v_coach_conflict.id,
        'conflicting_starts_at', v_coach_conflict.starts_at,
        'conflicting_ends_at', v_coach_conflict.ends_at,
        'conflicting_title', v_coach_conflict.title
      );
    END IF;
  END IF;

  -- Phase 2: equipment intentionally NOT conflict-checked (off-the-shelf model)

  IF jsonb_array_length(v_conflicts) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'conflict',
      'conflicts', v_conflicts
    );
  END IF;

  INSERT INTO public.facility_reservations (
    space_id, coach_user_id, starts_at, ends_at, title, email, notes, status
  ) VALUES (
    p_space_id, p_coach_user_id, p_starts_at, p_ends_at, p_title, p_email, p_notes, p_status
  )
  RETURNING id INTO v_reservation_id;

  INSERT INTO public.reservation_resources (reservation_id, resource_type, resource_id, starts_at, ends_at, status)
  VALUES (v_reservation_id, 'space', p_space_id, p_starts_at, p_ends_at, p_status);

  IF p_coach_user_id IS NOT NULL THEN
    INSERT INTO public.reservation_resources (reservation_id, resource_type, resource_id, starts_at, ends_at, status)
    VALUES (v_reservation_id, 'coach', p_coach_user_id, p_starts_at, p_ends_at, p_status);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', v_reservation_id
  );
END;
$$;

-- 6. preview_recurring_conflicts (stub)
CREATE OR REPLACE FUNCTION public.preview_recurring_conflicts(
  p_space_id UUID,
  p_coach_user_id UUID,
  p_starts_at TIMESTAMPTZ,
  p_ends_at TIMESTAMPTZ,
  p_recurrence_rule TEXT DEFAULT NULL,
  p_series_end_date DATE DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_conflicts JSONB := '[]'::jsonb;
  v_space_conflict RECORD;
  v_coach_conflict RECORD;
BEGIN
  IF NOT (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Access denied: owner or admin role required';
  END IF;

  SELECT id, starts_at, ends_at, title
  INTO v_space_conflict
  FROM public.facility_reservations
  WHERE space_id = p_space_id
    AND status <> 'cancelled'
    AND tstzrange(starts_at, ends_at, '[)') && tstzrange(p_starts_at, p_ends_at, '[)')
  LIMIT 1;

  IF v_space_conflict.id IS NOT NULL THEN
    v_conflicts := v_conflicts || jsonb_build_object(
      'occurrence_starts_at', p_starts_at,
      'resource_type', 'space',
      'resource_id', p_space_id,
      'conflicting_reservation_id', v_space_conflict.id
    );
  END IF;

  IF p_coach_user_id IS NOT NULL THEN
    SELECT id, starts_at, ends_at, title
    INTO v_coach_conflict
    FROM public.facility_reservations
    WHERE coach_user_id = p_coach_user_id
      AND status <> 'cancelled'
      AND tstzrange(starts_at, ends_at, '[)') && tstzrange(p_starts_at, p_ends_at, '[)')
    LIMIT 1;

    IF v_coach_conflict.id IS NOT NULL THEN
      v_conflicts := v_conflicts || jsonb_build_object(
        'occurrence_starts_at', p_starts_at,
        'resource_type', 'coach',
        'resource_id', p_coach_user_id,
        'conflicting_reservation_id', v_coach_conflict.id
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'occurrences_checked', 1,
    'total_conflicts', jsonb_array_length(v_conflicts),
    'conflicts', v_conflicts
  );
END;
$$;