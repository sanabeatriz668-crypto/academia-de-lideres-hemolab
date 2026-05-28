
-- Library files table
CREATE TABLE public.library_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.library_files TO authenticated;
GRANT ALL ON public.library_files TO service_role;

ALTER TABLE public.library_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view library files"
ON public.library_files FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins manage library files insert"
ON public.library_files FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins manage library files update"
ON public.library_files FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins manage library files delete"
ON public.library_files FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('library', 'library', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read library bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'library');

CREATE POLICY "Admins upload to library bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'library' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins update library bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'library' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));

CREATE POLICY "Admins delete library bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'library' AND EXISTS (SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'));

-- Action plan follow-up notes
ALTER TABLE public.action_plans ADD COLUMN IF NOT EXISTS progress_notes TEXT;
