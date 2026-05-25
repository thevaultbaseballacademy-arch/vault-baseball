
CREATE INDEX IF NOT EXISTS idx_remote_lessons_coach ON public.remote_lessons (coach_user_id);
CREATE INDEX IF NOT EXISTS idx_remote_lessons_athlete ON public.remote_lessons (athlete_user_id);
CREATE INDEX IF NOT EXISTS idx_remote_lessons_status ON public.remote_lessons (status);
CREATE INDEX IF NOT EXISTS idx_remote_lessons_scheduled_at ON public.remote_lessons (scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_remote_lessons_coach_status_sched ON public.remote_lessons (coach_user_id, status, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_remote_lessons_athlete_status_sched ON public.remote_lessons (athlete_user_id, status, scheduled_at DESC);

CREATE INDEX IF NOT EXISTS idx_clf_coach ON public.coach_lesson_feedback (coach_user_id);
CREATE INDEX IF NOT EXISTS idx_clf_athlete ON public.coach_lesson_feedback (athlete_user_id);
CREATE INDEX IF NOT EXISTS idx_clf_lesson ON public.coach_lesson_feedback (lesson_id);
CREATE INDEX IF NOT EXISTS idx_clf_submitted_at ON public.coach_lesson_feedback (submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_caa_coach_active ON public.coach_athlete_assignments (coach_user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_caa_athlete_active ON public.coach_athlete_assignments (athlete_user_id, is_active);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user ON public.course_enrollments (user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON public.course_enrollments (course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_status ON public.course_enrollments (user_id, status);

CREATE INDEX IF NOT EXISTS idx_athlete_checkins_user_date ON public.athlete_checkins (user_id, checkin_date DESC);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_lookup ON public.profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON public.audit_logs (changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_by ON public.audit_logs (changed_by);

ANALYZE public.remote_lessons;
ANALYZE public.coach_lesson_feedback;
ANALYZE public.coach_athlete_assignments;
ANALYZE public.course_enrollments;
ANALYZE public.athlete_checkins;
ANALYZE public.user_roles;
ANALYZE public.profiles;
ANALYZE public.audit_logs;
