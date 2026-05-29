
-- Fix athlete_development_scores: enforce athlete_approved via helper function
DROP POLICY IF EXISTS "Coaches view assigned athlete scores" ON public.athlete_development_scores;
CREATE POLICY "Coaches view assigned athlete scores"
ON public.athlete_development_scores
FOR SELECT
USING (
  public.is_active_coach_for_athlete(auth.uid(), user_id)
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Remove weaker duplicate policy on development_recommendations
DROP POLICY IF EXISTS "Coaches view/manage assigned recommendations" ON public.development_recommendations;

-- Fix inverted argument order on profiles coach policy
DROP POLICY IF EXISTS "Coaches can view assigned athlete profiles" ON public.profiles;
CREATE POLICY "Coaches can view assigned athlete profiles"
ON public.profiles
FOR SELECT
USING (public.is_active_coach_for_athlete(auth.uid(), user_id));

-- Enforce athlete_approved on recruiting_profiles coach policy
DROP POLICY IF EXISTS "Coaches can view assigned athlete recruiting profiles" ON public.recruiting_profiles;
CREATE POLICY "Coaches can view assigned athlete recruiting profiles"
ON public.recruiting_profiles
FOR SELECT
USING (public.is_active_coach_for_athlete(auth.uid(), user_id));
