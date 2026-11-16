-- Ready2Hire Storage Buckets & Policies Setup
-- Buckets: 'resumes', 'avatars', 'proctoring-evidence'

-- 1. Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('resumes', 'resumes', false, 10485760, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']),
  ('proctoring-evidence', 'proctoring-evidence', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Avatars RLS policies
CREATE POLICY "Public avatars can be viewed by anyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update or delete their avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Resumes RLS policies (Strictly private)
CREATE POLICY "Users can upload their own resumes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view and download their own resumes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'resumes' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('recruiter', 'admin'))
    )
  );

CREATE POLICY "Users can delete their own resumes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 4. Proctoring Evidence RLS policies (Strictly private)
CREATE POLICY "Candidates can upload proctoring evidence during tests"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'proctoring-evidence' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Evidence viewable by candidate, recruiters and admins"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'proctoring-evidence' AND (
      (storage.foldername(name))[1] = auth.uid()::text OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('recruiter', 'admin'))
    )
  );
