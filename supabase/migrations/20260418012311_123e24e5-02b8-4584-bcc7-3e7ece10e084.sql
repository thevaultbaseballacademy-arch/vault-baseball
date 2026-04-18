-- Facility Spaces
CREATE TABLE public.facility_spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  space_type TEXT NOT NULL DEFAULT 'general',
  capacity INTEGER NOT NULL DEFAULT 1,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  grid_x INTEGER NOT NULL DEFAULT 0,
  grid_y INTEGER NOT NULL DEFAULT 0,
  grid_w INTEGER NOT NULL DEFAULT 2,
  grid_h INTEGER NOT NULL DEFAULT 2,
  zone TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.facility_spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage facility spaces"
ON public.facility_spaces FOR ALL
USING (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_facility_spaces_updated
BEFORE UPDATE ON public.facility_spaces
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Facility Hours
CREATE TABLE public.facility_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL DEFAULT '09:00',
  close_time TIME NOT NULL DEFAULT '21:00',
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(day_of_week)
);

ALTER TABLE public.facility_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage facility hours"
ON public.facility_hours FOR ALL
USING (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_facility_hours_updated
BEFORE UPDATE ON public.facility_hours
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default hours (Mon-Sat 9am-9pm, Sun closed)
INSERT INTO public.facility_hours (day_of_week, open_time, close_time, is_closed) VALUES
(0, '10:00', '18:00', true),
(1, '09:00', '21:00', false),
(2, '09:00', '21:00', false),
(3, '09:00', '21:00', false),
(4, '09:00', '21:00', false),
(5, '09:00', '21:00', false),
(6, '09:00', '18:00', false);

-- Facility Settings (singleton)
CREATE TABLE public.facility_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  min_booking_minutes INTEGER NOT NULL DEFAULT 30,
  max_booking_minutes INTEGER NOT NULL DEFAULT 240,
  advance_booking_days INTEGER NOT NULL DEFAULT 60,
  slot_size_minutes INTEGER NOT NULL DEFAULT 30,
  enforce_hours BOOLEAN NOT NULL DEFAULT true,
  enforce_max_length BOOLEAN NOT NULL DEFAULT true,
  enforce_advance_window BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.facility_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage facility settings"
ON public.facility_settings FOR ALL
USING (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_facility_settings_updated
BEFORE UPDATE ON public.facility_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.facility_settings DEFAULT VALUES;

-- Facility Reservations
CREATE TABLE public.facility_reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  space_id UUID NOT NULL REFERENCES public.facility_spaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  attendee_count INTEGER DEFAULT 1,
  reserved_for TEXT,
  color TEXT,
  recurrence_rule TEXT,
  recurrence_group_id UUID,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX idx_facility_reservations_space_time ON public.facility_reservations(space_id, starts_at, ends_at);
CREATE INDEX idx_facility_reservations_starts_at ON public.facility_reservations(starts_at);

ALTER TABLE public.facility_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage facility reservations"
ON public.facility_reservations FOR ALL
USING (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_facility_reservations_updated
BEFORE UPDATE ON public.facility_reservations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Booking rules engine
CREATE OR REPLACE FUNCTION public.validate_facility_reservation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings RECORD;
  v_hours RECORD;
  v_dow INTEGER;
  v_duration_min INTEGER;
  v_overlap_count INTEGER;
  v_local_start TIME;
  v_local_end TIME;
BEGIN
  IF NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  -- Conflict check (always enforced)
  SELECT COUNT(*) INTO v_overlap_count
  FROM public.facility_reservations r
  WHERE r.space_id = NEW.space_id
    AND r.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND r.status <> 'cancelled'
    AND r.starts_at < NEW.ends_at
    AND r.ends_at > NEW.starts_at;

  IF v_overlap_count > 0 THEN
    RAISE EXCEPTION 'This space is already booked during that time window.';
  END IF;

  SELECT * INTO v_settings FROM public.facility_settings LIMIT 1;

  IF v_settings IS NULL THEN
    RETURN NEW;
  END IF;

  v_duration_min := EXTRACT(EPOCH FROM (NEW.ends_at - NEW.starts_at)) / 60;

  IF v_duration_min < v_settings.min_booking_minutes THEN
    RAISE EXCEPTION 'Booking must be at least % minutes.', v_settings.min_booking_minutes;
  END IF;

  IF v_settings.enforce_max_length AND v_duration_min > v_settings.max_booking_minutes THEN
    RAISE EXCEPTION 'Booking cannot exceed % minutes.', v_settings.max_booking_minutes;
  END IF;

  IF v_settings.enforce_advance_window
     AND NEW.starts_at > now() + (v_settings.advance_booking_days || ' days')::interval THEN
    RAISE EXCEPTION 'Booking is too far in the future (max % days).', v_settings.advance_booking_days;
  END IF;

  IF v_settings.enforce_hours THEN
    v_dow := EXTRACT(DOW FROM NEW.starts_at)::INTEGER;
    SELECT * INTO v_hours FROM public.facility_hours WHERE day_of_week = v_dow;

    IF v_hours IS NOT NULL THEN
      IF v_hours.is_closed THEN
        RAISE EXCEPTION 'Facility is closed on that day.';
      END IF;

      v_local_start := NEW.starts_at::TIME;
      v_local_end := NEW.ends_at::TIME;

      IF v_local_start < v_hours.open_time OR v_local_end > v_hours.close_time THEN
        RAISE EXCEPTION 'Booking is outside facility hours (% - %).', v_hours.open_time, v_hours.close_time;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_facility_reservation
BEFORE INSERT OR UPDATE ON public.facility_reservations
FOR EACH ROW EXECUTE FUNCTION public.validate_facility_reservation();