-- Publish the summer camp so registration is open
UPDATE public.camps SET status = 'published' WHERE name = '22M Elite Summer Development Camp';

-- Public read of camp + cohorts + sessions (already-published rows only)
DROP POLICY IF EXISTS "camps_public_read_published" ON public.camps;
CREATE POLICY "camps_public_read_published" ON public.camps
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "camp_cohorts_public_read_published" ON public.camp_cohorts;
CREATE POLICY "camp_cohorts_public_read_published" ON public.camp_cohorts
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.camps c WHERE c.id = camp_cohorts.camp_id AND c.status = 'published'));

DROP POLICY IF EXISTS "camp_sessions_public_read_open" ON public.camp_sessions;
CREATE POLICY "camp_sessions_public_read_open" ON public.camp_sessions
  FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.camp_cohorts ch
    JOIN public.camps c ON c.id = ch.camp_id
    WHERE ch.id = camp_sessions.cohort_id AND c.status = 'published'
  ));

-- Security-definer function to get available capacity per session (no PII exposed)
CREATE OR REPLACE FUNCTION public.get_camp_session_capacity(p_session_ids uuid[])
RETURNS TABLE (session_id uuid, confirmed_count integer, pending_count integer, capacity integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    s.id AS session_id,
    COALESCE(SUM(CASE WHEN crs.status = 'confirmed' THEN 1 ELSE 0 END)::int, 0) AS confirmed_count,
    COALESCE(SUM(CASE WHEN crs.status = 'pending' THEN 1 ELSE 0 END)::int, 0) AS pending_count,
    s.capacity
  FROM public.camp_sessions s
  LEFT JOIN public.camp_registration_sessions crs ON crs.session_id = s.id
  WHERE s.id = ANY(p_session_ids)
  GROUP BY s.id, s.capacity;
$$;

GRANT EXECUTE ON FUNCTION public.get_camp_session_capacity(uuid[]) TO anon, authenticated;