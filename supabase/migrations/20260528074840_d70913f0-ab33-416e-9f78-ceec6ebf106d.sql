REVOKE SELECT (email) ON public.coaches FROM anon, authenticated, PUBLIC;
REVOKE SELECT (correct_answers) ON public.video_questions FROM anon, authenticated, PUBLIC;

DROP POLICY IF EXISTS "Coaches can view their assigned essa reservations" ON public.facility_reservations;
CREATE POLICY "Coaches can view their assigned essa reservations"
ON public.facility_reservations
FOR SELECT
TO authenticated
USING (coach_user_id = auth.uid() AND notes LIKE 'ESSA:%');

DROP POLICY IF EXISTS "Users view own ESSA reservations" ON public.facility_reservations;
CREATE POLICY "Users view own ESSA reservations"
ON public.facility_reservations
FOR SELECT
TO authenticated
USING (
  (created_by = auth.uid() AND notes LIKE 'ESSA:%')
  OR is_owner(auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Anyone can submit a summer camp registration" ON public.summer_camp_registrations;
CREATE POLICY "Anyone can submit a summer camp registration"
ON public.summer_camp_registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  parent_email IS NOT NULL AND length(trim(parent_email)) > 3 AND parent_email LIKE '%@%.%'
  AND parent_name IS NOT NULL AND length(trim(parent_name)) > 0
  AND athlete_first_name IS NOT NULL AND length(trim(athlete_first_name)) > 0
);