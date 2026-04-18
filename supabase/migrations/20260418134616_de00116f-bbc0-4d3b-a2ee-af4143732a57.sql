-- 1. Add coach assignment column to facility_reservations
ALTER TABLE public.facility_reservations
ADD COLUMN IF NOT EXISTS coach_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_facility_reservations_coach_starts
  ON public.facility_reservations (coach_user_id, starts_at);

-- 2. Allow coaches to view ESSA reservations assigned to them
DROP POLICY IF EXISTS "Coaches can view their assigned essa reservations" ON public.facility_reservations;
CREATE POLICY "Coaches can view their assigned essa reservations"
  ON public.facility_reservations
  FOR SELECT
  USING (
    coach_user_id = auth.uid()
    OR (
      coach_user_id IS NOT NULL
      AND auth.uid() = coach_user_id
      AND notes LIKE 'ESSA:%'
    )
  );

-- 3. Helper: get a coach's ESSA-bookable windows on a given date
CREATE OR REPLACE FUNCTION public.get_coach_essa_availability(
  p_coach_user_id uuid,
  p_date date,
  p_duration_minutes int DEFAULT 30
)
RETURNS TABLE(slot_start timestamptz, slot_end timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dow int := EXTRACT(DOW FROM p_date)::int;
  v_window RECORD;
  v_cursor timestamptz;
  v_end timestamptz;
  v_step interval := (p_duration_minutes || ' minutes')::interval;
BEGIN
  FOR v_window IN
    SELECT start_time, end_time
    FROM public.coach_availability
    WHERE coach_user_id = p_coach_user_id
      AND day_of_week = v_dow
      AND is_active = true
  LOOP
    v_cursor := (p_date::text || ' ' || v_window.start_time::text)::timestamptz;
    v_end    := (p_date::text || ' ' || v_window.end_time::text)::timestamptz;

    WHILE v_cursor + v_step <= v_end LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.facility_reservations r
        WHERE r.coach_user_id = p_coach_user_id
          AND r.status <> 'cancelled'
          AND r.starts_at < v_cursor + v_step
          AND r.ends_at   > v_cursor
      ) AND v_cursor > now() THEN
        slot_start := v_cursor;
        slot_end   := v_cursor + v_step;
        RETURN NEXT;
      END IF;
      v_cursor := v_cursor + v_step;
    END LOOP;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_coach_essa_availability(uuid, date, int) TO authenticated;