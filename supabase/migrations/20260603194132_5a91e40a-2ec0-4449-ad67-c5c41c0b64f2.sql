REVOKE SELECT (correct_answers) ON public.video_questions FROM anon, authenticated, PUBLIC;
REVOKE SELECT (stripe_account_id) ON public.coaches FROM anon, authenticated, PUBLIC;