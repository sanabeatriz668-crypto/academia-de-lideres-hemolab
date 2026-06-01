-- Add leader_id to profiles to link participants to leaders
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS leader_id uuid;
CREATE INDEX IF NOT EXISTS idx_profiles_leader_id ON public.profiles(leader_id);

-- Evaluation forms
CREATE TABLE public.evaluation_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_by uuid NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evaluation_forms TO authenticated;
GRANT ALL ON public.evaluation_forms TO service_role;
ALTER TABLE public.evaluation_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view active forms" ON public.evaluation_forms
  FOR SELECT TO authenticated USING (active = true OR EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY "Admins manage forms" ON public.evaluation_forms
  FOR ALL TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  ));

CREATE TRIGGER update_evaluation_forms_updated_at
  BEFORE UPDATE ON public.evaluation_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Form questions
CREATE TABLE public.form_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.evaluation_forms(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'text', -- 'text' | 'scale' | 'choice'
  options jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_questions TO authenticated;
GRANT ALL ON public.form_questions TO service_role;
ALTER TABLE public.form_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view questions" ON public.form_questions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage questions" ON public.form_questions
  FOR ALL TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Form responses
CREATE TABLE public.form_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.evaluation_forms(id) ON DELETE CASCADE,
  respondent_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_responses TO authenticated;
GRANT ALL ON public.form_responses TO service_role;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users create own responses" ON public.form_responses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = respondent_id);
CREATE POLICY "Users view own responses" ON public.form_responses
  FOR SELECT TO authenticated USING (auth.uid() = respondent_id);
CREATE POLICY "Admins view all responses" ON public.form_responses
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY "Leaders view their participants responses" ON public.form_responses
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = form_responses.respondent_id
      AND p.leader_id = auth.uid()
  ));
CREATE POLICY "Admins delete responses" ON public.form_responses
  FOR DELETE TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Form answers
CREATE TABLE public.form_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL REFERENCES public.form_responses(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.form_questions(id) ON DELETE CASCADE,
  answer_text text,
  answer_number numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.form_answers TO authenticated;
GRANT ALL ON public.form_answers TO service_role;
ALTER TABLE public.form_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users create answers for own response" ON public.form_answers
  FOR INSERT TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM form_responses r WHERE r.id = response_id AND r.respondent_id = auth.uid()
  ));
CREATE POLICY "Users view answers for own response" ON public.form_answers
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM form_responses r WHERE r.id = response_id AND r.respondent_id = auth.uid()
  ));
CREATE POLICY "Admins view all answers" ON public.form_answers
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY "Leaders view their participants answers" ON public.form_answers
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM form_responses r
    JOIN profiles p ON p.user_id = r.respondent_id
    WHERE r.id = form_answers.response_id AND p.leader_id = auth.uid()
  ));