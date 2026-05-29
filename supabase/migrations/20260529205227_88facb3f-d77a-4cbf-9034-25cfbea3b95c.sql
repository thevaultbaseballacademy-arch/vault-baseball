CREATE TABLE public.parent_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  parent_first_name TEXT,
  parent_last_name TEXT,
  parent_name TEXT,
  parent_phone TEXT,
  stripe_customer_id TEXT UNIQUE,
  user_id UUID,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_parent_profiles_email ON public.parent_profiles (email);
CREATE INDEX idx_parent_profiles_user_id ON public.parent_profiles (user_id);

GRANT SELECT, INSERT, UPDATE ON public.parent_profiles TO authenticated;
GRANT ALL ON public.parent_profiles TO service_role;

ALTER TABLE public.parent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all parent profiles"
ON public.parent_profiles FOR SELECT TO authenticated
USING (public.has_admin_role(auth.uid()));

CREATE POLICY "Users can view own parent profile"
ON public.parent_profiles FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

CREATE POLICY "Admins can update parent profiles"
ON public.parent_profiles FOR UPDATE TO authenticated
USING (public.has_admin_role(auth.uid()));

CREATE POLICY "Users can update own parent profile"
ON public.parent_profiles FOR UPDATE TO authenticated
USING (
  user_id = auth.uid()
  OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

CREATE POLICY "Admins can insert parent profiles"
ON public.parent_profiles FOR INSERT TO authenticated
WITH CHECK (public.has_admin_role(auth.uid()));

CREATE TRIGGER update_parent_profiles_updated_at
BEFORE UPDATE ON public.parent_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Backfill from team_registrations
INSERT INTO public.parent_profiles (email, parent_first_name, parent_last_name, parent_name, parent_phone, first_seen_at, last_seen_at)
SELECT lower(parent_email), max(parent_first_name), max(parent_last_name),
       max(parent_first_name || ' ' || parent_last_name), max(parent_phone),
       min(created_at), max(created_at)
FROM public.team_registrations
WHERE parent_email IS NOT NULL AND parent_email <> ''
GROUP BY lower(parent_email)
ON CONFLICT (email) DO NOTHING;

-- Backfill from tryout_registrations
INSERT INTO public.parent_profiles (email, parent_name, parent_phone, first_seen_at, last_seen_at)
SELECT lower(parent_email), max(parent_name), max(parent_phone),
       min(registered_at), max(registered_at)
FROM public.tryout_registrations
WHERE parent_email IS NOT NULL AND parent_email <> ''
GROUP BY lower(parent_email)
ON CONFLICT (email) DO UPDATE SET
  parent_name = COALESCE(public.parent_profiles.parent_name, EXCLUDED.parent_name),
  parent_phone = COALESCE(public.parent_profiles.parent_phone, EXCLUDED.parent_phone),
  first_seen_at = LEAST(public.parent_profiles.first_seen_at, EXCLUDED.first_seen_at),
  last_seen_at = GREATEST(public.parent_profiles.last_seen_at, EXCLUDED.last_seen_at);

-- Backfill from camp_registrations
INSERT INTO public.parent_profiles (email, parent_name, parent_phone, first_seen_at, last_seen_at)
SELECT lower(parent_email), max(parent_name), max(parent_phone),
       min(registered_at), max(registered_at)
FROM public.camp_registrations
WHERE parent_email IS NOT NULL AND parent_email <> ''
GROUP BY lower(parent_email)
ON CONFLICT (email) DO UPDATE SET
  parent_name = COALESCE(public.parent_profiles.parent_name, EXCLUDED.parent_name),
  parent_phone = COALESCE(public.parent_profiles.parent_phone, EXCLUDED.parent_phone),
  first_seen_at = LEAST(public.parent_profiles.first_seen_at, EXCLUDED.first_seen_at),
  last_seen_at = GREATEST(public.parent_profiles.last_seen_at, EXCLUDED.last_seen_at);