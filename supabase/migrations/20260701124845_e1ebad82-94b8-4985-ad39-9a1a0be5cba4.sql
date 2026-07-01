
CREATE POLICY "Leaders view subordinate completions"
ON public.task_completions FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = task_completions.user_id AND p.leader_id = auth.uid()));

CREATE POLICY "Leaders view subordinate action plans"
ON public.action_plans FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = action_plans.user_id AND p.leader_id = auth.uid()));

CREATE POLICY "Leaders view subordinate module progress"
ON public.module_progress FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = module_progress.user_id AND p.leader_id = auth.uid()));

CREATE POLICY "Leaders view subordinate training progress"
ON public.training_progress FOR SELECT
USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = training_progress.user_id AND p.leader_id = auth.uid()));
