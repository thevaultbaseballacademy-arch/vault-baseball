-- 1. Space types library
CREATE TABLE IF NOT EXISTS public.space_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  default_capacity integer NOT NULL DEFAULT 1,
  default_duration_minutes integer NOT NULL DEFAULT 60,
  allows_pitching_machine boolean NOT NULL DEFAULT false,
  coach_required text NOT NULL DEFAULT 'optional' CHECK (coach_required IN ('yes','no','optional')),
  is_custom boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.space_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view space types"
  ON public.space_types FOR SELECT TO authenticated USING (true);

CREATE POLICY "Owners and admins manage space types"
  ON public.space_types FOR ALL TO authenticated
  USING (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.is_owner(auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_space_types_updated_at
  BEFORE UPDATE ON public.space_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed 9 defaults
INSERT INTO public.space_types
  (key, name, icon, color, default_capacity, default_duration_minutes, allows_pitching_machine, coach_required, is_custom, display_order)
VALUES
  ('batting_cage',    'Batting Cage',    '🥎', '#3B82F6', 1, 30, true,  'no',       false, 1),
  ('pitching_mound',  'Pitching Mound',  '⚾', '#EF4444', 2, 30, false, 'optional', false, 2),
  ('pitching_tunnel', 'Pitching Tunnel', '🎯', '#F97316', 2, 30, true,  'optional', false, 3),
  ('infield',         'Infield',         '💎', '#22C55E', 9, 60, false, 'optional', false, 4),
  ('outfield',        'Outfield',        '🟩', '#86EFAC', 6, 60, false, 'optional', false, 5),
  ('lesson_room',     'Lesson Room',     '📋', '#A855F7', 1, 60, false, 'yes',      false, 6),
  ('weight_room',     'Weight Room',     '🏋️', '#6B7280', 8, 60, false, 'optional', false, 7),
  ('classroom',       'Classroom',       '🎓', '#EAB308', 12, 60, false, 'no',      false, 8),
  ('custom',          'Custom',          '⬜', '#94A3B8', 1, 60, false, 'optional', true,  99)
ON CONFLICT (key) DO NOTHING;

-- 2. Link facility_spaces to a type (nullable; existing spaces unaffected)
ALTER TABLE public.facility_spaces
  ADD COLUMN IF NOT EXISTS type_id uuid REFERENCES public.space_types(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_facility_spaces_type_id ON public.facility_spaces(type_id);

-- 3. Enable realtime on facility_reservations
ALTER TABLE public.facility_reservations REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'facility_reservations'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.facility_reservations';
  END IF;
END $$;