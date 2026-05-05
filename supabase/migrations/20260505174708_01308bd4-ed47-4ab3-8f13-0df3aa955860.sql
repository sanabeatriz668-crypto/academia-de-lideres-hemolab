
-- Trainings
CREATE TABLE public.trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  link TEXT,
  duration_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view trainings" ON public.trainings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage trainings" ON public.trainings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));

-- Training progress
CREATE TABLE public.training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  training_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  progress INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, training_id)
);
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own training progress" ON public.training_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all training progress" ON public.training_progress FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Users insert own training progress" ON public.training_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own training progress" ON public.training_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Evaluation criteria
CREATE TABLE public.evaluation_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.evaluation_criteria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view criteria" ON public.evaluation_criteria FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage criteria" ON public.evaluation_criteria FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));

-- Allow admins to view all module_progress and task_completions for tracking
CREATE POLICY "Admins view all module progress" ON public.module_progress FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins view all task completions" ON public.task_completions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));
