
REVOKE SELECT (correct_answers) ON public.video_questions FROM anon, authenticated, PUBLIC;
REVOKE SELECT (email) ON public.coaches FROM anon, authenticated, PUBLIC;
REVOKE SELECT (stripe_account_id) ON public.coaches FROM anon, authenticated, PUBLIC;

DROP POLICY IF EXISTS "Coaches read assigned athlete sessions" ON public.softball_pitching_sessions;
CREATE POLICY "Coaches read assigned athlete sessions"
ON public.softball_pitching_sessions FOR SELECT TO authenticated
USING (public.is_active_coach_for_athlete(auth.uid(), athlete_user_id));

DROP POLICY IF EXISTS "Coaches read assigned athlete slap sessions" ON public.softball_slap_sessions;
CREATE POLICY "Coaches read assigned athlete slap sessions"
ON public.softball_slap_sessions FOR SELECT TO authenticated
USING (public.is_active_coach_for_athlete(auth.uid(), athlete_user_id));

DROP POLICY IF EXISTS "Coaches view assigned recommendations" ON public.development_recommendations;
DROP POLICY IF EXISTS "Coaches manage assigned recommendations" ON public.development_recommendations;
CREATE POLICY "Coaches view assigned recommendations"
ON public.development_recommendations FOR SELECT TO authenticated
USING (public.is_active_coach_for_athlete(auth.uid(), athlete_user_id));
CREATE POLICY "Coaches manage assigned recommendations"
ON public.development_recommendations FOR ALL TO authenticated
USING (public.is_active_coach_for_athlete(auth.uid(), athlete_user_id))
WITH CHECK (public.is_active_coach_for_athlete(auth.uid(), athlete_user_id));

DROP POLICY IF EXISTS "Coaches read assigned athlete workload" ON public.workload_records;
CREATE POLICY "Coaches read assigned athlete workload"
ON public.workload_records FOR SELECT TO authenticated
USING (public.is_active_coach_for_athlete(auth.uid(), athlete_user_id));

DROP POLICY IF EXISTS "Coaches can view assigned athlete checklists" ON public.recruiting_checklist;
CREATE POLICY "Coaches can view assigned athlete checklists"
ON public.recruiting_checklist FOR SELECT TO authenticated
USING (public.is_active_coach_for_athlete(auth.uid(), user_id));

DROP POLICY IF EXISTS "Coaches read assigned athlete exports" ON public.recruiting_exports;
CREATE POLICY "Coaches read assigned athlete exports"
ON public.recruiting_exports FOR SELECT TO authenticated
USING (public.is_active_coach_for_athlete(auth.uid(), athlete_user_id));

DROP POLICY IF EXISTS "Coaches can view assigned athlete showcase events" ON public.showcase_events;
CREATE POLICY "Coaches can view assigned athlete showcase events"
ON public.showcase_events FOR SELECT TO authenticated
USING (public.is_active_coach_for_athlete(auth.uid(), user_id));
