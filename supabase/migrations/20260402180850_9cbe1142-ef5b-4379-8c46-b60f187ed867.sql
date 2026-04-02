
-- Training programs table
CREATE TABLE public.training_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assigned_by UUID,
  athlete_user_id UUID,
  title TEXT NOT NULL,
  sport TEXT NOT NULL DEFAULT 'baseball',
  position TEXT,
  season_phase TEXT NOT NULL DEFAULT 'offseason',
  available_days INTEGER NOT NULL DEFAULT 5,
  equipment TEXT NOT NULL DEFAULT 'gym',
  age_group TEXT,
  experience_level TEXT DEFAULT 'intermediate',
  program_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  week_number INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  compliance_pct NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Exercise completion tracking
CREATE TABLE public.program_exercise_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.training_programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  day_index INTEGER NOT NULL,
  exercise_index INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(program_id, user_id, day_index, exercise_index)
);

-- Enable RLS
ALTER TABLE public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_exercise_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for training_programs
CREATE POLICY "Users can view own programs"
  ON public.training_programs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = athlete_user_id OR auth.uid() = assigned_by);

CREATE POLICY "Users can create programs"
  ON public.training_programs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() = assigned_by);

CREATE POLICY "Users can update own programs"
  ON public.training_programs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = assigned_by OR auth.uid() = athlete_user_id);

-- RLS policies for completions
CREATE POLICY "Users can view own completions"
  ON public.program_exercise_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert completions"
  ON public.program_exercise_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
  ON public.program_exercise_completions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_training_programs_updated_at
  BEFORE UPDATE ON public.training_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
