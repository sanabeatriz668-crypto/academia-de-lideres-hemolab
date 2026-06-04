
-- task_questions
CREATE TABLE public.task_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'text',
  options jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_questions TO authenticated;
GRANT ALL ON public.task_questions TO service_role;
ALTER TABLE public.task_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view task questions" ON public.task_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage task questions" ON public.task_questions FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));

-- task_question_answers
CREATE TABLE public.task_question_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.task_questions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  answer_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (question_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_question_answers TO authenticated;
GRANT ALL ON public.task_question_answers TO service_role;
ALTER TABLE public.task_question_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own answers select" ON public.task_question_answers FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role IN ('admin','lider')));
CREATE POLICY "Users insert own answers" ON public.task_question_answers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own answers" ON public.task_question_answers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own answers" ON public.task_question_answers FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
CREATE TRIGGER trg_task_answers_updated BEFORE UPDATE ON public.task_question_answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- training_documents
CREATE TABLE public.training_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id uuid NOT NULL REFERENCES public.trainings(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  file_size bigint,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_documents TO authenticated;
GRANT ALL ON public.training_documents TO service_role;
ALTER TABLE public.training_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated view training docs" ON public.training_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage training docs" ON public.training_documents FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));
