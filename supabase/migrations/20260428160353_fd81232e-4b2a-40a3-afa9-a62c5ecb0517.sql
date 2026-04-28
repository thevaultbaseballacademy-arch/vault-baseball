-- Player Evaluation System (MVP)
-- Templates are static defaults defined in app code; we still store template_key
-- on each evaluation for future migration to a builder.

CREATE TABLE public.player_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_user_id UUID NOT NULL,
  evaluator_user_id UUID NOT NULL,
  program_id UUID NULL,
  session_label TEXT NULL,
  template_key TEXT NOT NULL,        -- 'pitching_9_12' | 'pitching_13_17'
  age_group TEXT NOT NULL,           -- '9-12' | '13-17'
  scores JSONB NOT NULL DEFAULT '{}'::jsonb, -- { mechanics: 7, command: 6, ... }
  category_notes JSONB NOT NULL DEFAULT '{}'::jsonb,
  session_note TEXT NULL,
  overall_score NUMERIC(4,2) NULL,   -- weighted, computed client-side
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_player_evaluations_athlete ON public.player_evaluations(athlete_user_id, evaluated_at DESC);
CREATE INDEX idx_player_evaluations_evaluator ON public.player_evaluations(evaluator_user_id, evaluated_at DESC);

ALTER TABLE public.player_evaluations ENABLE ROW LEVEL SECURITY;

-- Coach who created it can read/write their own
CREATE POLICY "Evaluator manages own evaluations"
ON public.player_evaluations FOR ALL
USING (auth.uid() = evaluator_user_id)
WITH CHECK (auth.uid() = evaluator_user_id);

-- Athlete can view their own evaluations
CREATE POLICY "Athlete views own evaluations"
ON public.player_evaluations FOR SELECT
USING (auth.uid() = athlete_user_id);

-- Linked parents can view their child's evaluations
CREATE POLICY "Parent views child evaluations"
ON public.player_evaluations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.parent_athlete_links
    WHERE parent_user_id = auth.uid()
      AND athlete_user_id = player_evaluations.athlete_user_id
      AND status = 'active'
  )
);

-- Admins/owners full access
CREATE POLICY "Admins manage all evaluations"
ON public.player_evaluations FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.is_owner(auth.uid()))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_owner(auth.uid()));

CREATE TRIGGER trg_player_evaluations_updated
BEFORE UPDATE ON public.player_evaluations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- Development Reports (snapshot at end of program)
CREATE TABLE public.development_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_user_id UUID NOT NULL,
  generated_by UUID NOT NULL,
  program_label TEXT NOT NULL,        -- e.g. 'Spring 2026 Youth Pitching Lab'
  age_group TEXT NOT NULL,
  template_key TEXT NOT NULL,
  -- Snapshot payload: pre/post metrics, evaluator averages, notes, goals
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  coach_notes TEXT NULL,
  goals TEXT NULL,                    -- free-text v1
  overall_score NUMERIC(4,2) NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dev_reports_athlete ON public.development_reports(athlete_user_id, generated_at DESC);

ALTER TABLE public.development_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athlete views own reports"
ON public.development_reports FOR SELECT
USING (auth.uid() = athlete_user_id);

CREATE POLICY "Parent views child reports"
ON public.development_reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.parent_athlete_links
    WHERE parent_user_id = auth.uid()
      AND athlete_user_id = development_reports.athlete_user_id
      AND status = 'active'
  )
);

CREATE POLICY "Generator views own generated reports"
ON public.development_reports FOR SELECT
USING (auth.uid() = generated_by);

CREATE POLICY "Coaches/admins create reports"
ON public.development_reports FOR INSERT
WITH CHECK (
  auth.uid() = generated_by
  AND (
    public.has_role(auth.uid(), 'coach')
    OR public.has_role(auth.uid(), 'admin')
    OR public.is_owner(auth.uid())
  )
);

CREATE POLICY "Admins manage all reports"
ON public.development_reports FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.is_owner(auth.uid()))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.is_owner(auth.uid()));
