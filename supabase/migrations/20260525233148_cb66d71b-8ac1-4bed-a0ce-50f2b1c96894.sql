
-- 1. Remove broken anon "share token" policy on athlete_progress_reports
DROP POLICY IF EXISTS "Anyone can view via share token" ON public.athlete_progress_reports;

-- 2. Hide coach email from anonymous users (keep authenticated access intact)
REVOKE SELECT (email) ON public.coaches FROM anon;

-- 3. Hide correct_answers from all client roles; only service_role (edge functions) may read it
REVOKE SELECT (correct_answers) ON public.video_questions FROM anon, authenticated;

-- 4. Restrict activity_feed reads to the owning user (admins still covered by separate ALL policy)
DROP POLICY IF EXISTS "Authenticated users can view activity feed" ON public.activity_feed;
CREATE POLICY "Users can view own activity feed"
  ON public.activity_feed FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Require explicit athlete approval before coach can access athlete data
CREATE OR REPLACE FUNCTION public.is_active_coach_for_athlete(_coach_id uuid, _athlete_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.coach_athlete_assignments
    WHERE coach_user_id = _coach_id
      AND athlete_user_id = _athlete_id
      AND is_active = true
      AND athlete_approved = true
  )
$function$;

-- 6. Tighten notifications insert: caller must be the actor
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "Users can create notifications as themselves"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid());

-- 7. Grade video exam server-side: SECURITY DEFINER function callable by authenticated users
CREATE OR REPLACE FUNCTION public.grade_video_exam(
  _cert_type text,
  _answers jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  q record;
  user_q jsonb;
  correct jsonb;
  score int := 0;
  total int := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  FOR q IN
    SELECT id, correct_answers
    FROM public.video_questions
    WHERE certification_type = _cert_type AND is_active = true
  LOOP
    total := total + 4;
    user_q := _answers -> (q.id::text);
    correct := CASE WHEN jsonb_typeof(q.correct_answers) = 'string'
               THEN (q.correct_answers #>> '{}')::jsonb
               ELSE q.correct_answers END;
    IF user_q IS NOT NULL AND correct IS NOT NULL THEN
      IF (user_q ->> 'q1') IS NOT NULL AND (user_q ->> 'q1') = (correct ->> 'q1') THEN score := score + 1; END IF;
      IF (user_q ->> 'q2') IS NOT NULL AND (user_q ->> 'q2') = (correct ->> 'q2') THEN score := score + 1; END IF;
      IF (user_q ->> 'q3') IS NOT NULL AND (user_q ->> 'q3') = (correct ->> 'q3') THEN score := score + 1; END IF;
      IF (user_q ->> 'q4') IS NOT NULL AND (user_q ->> 'q4') = (correct ->> 'q4') THEN score := score + 1; END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('score', score, 'total_points', total);
END;
$$;

REVOKE ALL ON FUNCTION public.grade_video_exam(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grade_video_exam(text, jsonb) TO authenticated;
