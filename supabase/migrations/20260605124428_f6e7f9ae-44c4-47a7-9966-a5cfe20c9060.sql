
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS case_study text;
ALTER TABLE public.task_questions ADD COLUMN IF NOT EXISTS points integer NOT NULL DEFAULT 0;
ALTER TABLE public.form_questions ADD COLUMN IF NOT EXISTS correct_answer text;
