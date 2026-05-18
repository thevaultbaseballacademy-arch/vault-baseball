
-- Auto-link pending coach records (no user_id yet) on signup by email,
-- and grant coach role + foundations certification for verification badge.
CREATE OR REPLACE FUNCTION public.link_pending_coach_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coach record;
BEGIN
  SELECT * INTO v_coach
  FROM public.coaches
  WHERE lower(email) = lower(NEW.email)
    AND user_id IS NULL
  LIMIT 1;

  IF v_coach.id IS NOT NULL THEN
    UPDATE public.coaches
    SET user_id = NEW.id,
        status = 'Active'
    WHERE id = v_coach.id;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'coach')
    ON CONFLICT DO NOTHING;

    -- Grant Foundations certification (1yr) so VAULT verified badge shows
    INSERT INTO public.user_certifications
      (user_id, certification_type, status, issued_at, expires_at, score)
    VALUES
      (NEW.id, 'foundations', 'active', now(), now() + interval '1 year', 100)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- never block signup
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_link_pending_coach_on_signup ON auth.users;
CREATE TRIGGER trg_link_pending_coach_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.link_pending_coach_on_signup();
