
DROP POLICY IF EXISTS "Authenticated users can read active video questions" ON public.video_questions;
CREATE POLICY "Authenticated users can read active video questions"
ON public.video_questions FOR SELECT TO authenticated USING (is_active = true);
REVOKE SELECT (correct_answers) ON public.video_questions FROM authenticated, anon;

DROP POLICY IF EXISTS "Coaches can view assigned athletes profiles" ON public.profiles;

REVOKE SELECT (email) ON public.coaches FROM authenticated, anon;

DROP POLICY IF EXISTS "Coaches view assigned athletes mental records" ON public.mental_performance_records;
CREATE POLICY "Coaches view assigned athletes mental records"
ON public.mental_performance_records FOR SELECT
USING (public.is_active_coach_for_athlete(auth.uid(), athlete_user_id));

DROP POLICY IF EXISTS "Coaches read assigned athlete outputs" ON public.intelligence_outputs;
CREATE POLICY "Coaches read assigned athlete outputs"
ON public.intelligence_outputs FOR SELECT
USING (public.is_active_coach_for_athlete(auth.uid(), athlete_user_id));

DROP POLICY IF EXISTS "System manages progression" ON public.skill_progression;
CREATE POLICY "Coaches view approved assigned athlete progression"
ON public.skill_progression FOR SELECT TO authenticated
USING (public.is_active_coach_for_athlete(auth.uid(), athlete_user_id));
CREATE POLICY "Admins manage skill progression"
ON public.skill_progression FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR is_owner(auth.uid()));
CREATE POLICY "Athletes write own progression"
ON public.skill_progression FOR INSERT TO authenticated
WITH CHECK (athlete_user_id = auth.uid());
CREATE POLICY "Athletes update own progression"
ON public.skill_progression FOR UPDATE TO authenticated
USING (athlete_user_id = auth.uid())
WITH CHECK (athlete_user_id = auth.uid());

DROP POLICY IF EXISTS "Admins and coaches can view all credits" ON public.lesson_credits;
CREATE POLICY "Admins can view all credits"
ON public.lesson_credits FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_team_admin_access(auth.uid())
  OR has_team_access(auth.uid())
);
CREATE POLICY "Coaches view credits for approved assigned athletes"
ON public.lesson_credits FOR SELECT TO authenticated
USING (public.is_active_coach_for_athlete(auth.uid(), user_id));
