
-- Allow leaders to manage checkins of their liderados and admins to manage all
CREATE POLICY "Leaders view liderados checkins" ON public.evolution_checkins
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = evolution_checkins.user_id AND p.leader_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles me WHERE me.user_id = auth.uid() AND me.role = 'admin')
);

CREATE POLICY "Leaders insert liderados checkins" ON public.evolution_checkins
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = evolution_checkins.user_id AND p.leader_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles me WHERE me.user_id = auth.uid() AND me.role = 'admin')
);

CREATE POLICY "Leaders update liderados checkins" ON public.evolution_checkins
FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = evolution_checkins.user_id AND p.leader_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles me WHERE me.user_id = auth.uid() AND me.role = 'admin')
);

CREATE POLICY "Leaders delete liderados checkins" ON public.evolution_checkins
FOR DELETE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = evolution_checkins.user_id AND p.leader_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.profiles me WHERE me.user_id = auth.uid() AND me.role = 'admin')
);
