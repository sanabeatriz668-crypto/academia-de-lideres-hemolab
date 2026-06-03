ALTER TABLE public.schedule_events
ADD COLUMN class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL;