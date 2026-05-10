ALTER TABLE public.summer_camp_registrations
  ADD COLUMN IF NOT EXISTS camp_location text,
  ADD COLUMN IF NOT EXISTS selected_sessions text[],
  ADD COLUMN IF NOT EXISTS pricing_tier text,
  ADD COLUMN IF NOT EXISTS registration_type text;