INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('complaints', 'complaints', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('government-works', 'government-works', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('products', 'products', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('events', 'events', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "storage_public_read_project_buckets" ON storage.objects;
DROP POLICY IF EXISTS "storage_users_upload_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "storage_users_update_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "storage_users_delete_own_folder_or_admin" ON storage.objects;

CREATE POLICY "storage_public_read_project_buckets" ON storage.objects
FOR SELECT USING (
  bucket_id IN ('profile-images', 'complaints', 'government-works', 'products', 'events')
  OR (bucket_id = 'documents' AND auth.role() = 'authenticated')
);

CREATE POLICY "storage_users_upload_own_folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('profile-images', 'complaints', 'government-works', 'products', 'events', 'documents')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "storage_users_update_own_folder" ON storage.objects
FOR UPDATE TO authenticated
USING (
  (storage.foldername(name))[1] = auth.uid()::text
  OR public.current_user_role() = 'super_admin'
)
WITH CHECK (
  (storage.foldername(name))[1] = auth.uid()::text
  OR public.current_user_role() = 'super_admin'
);

CREATE POLICY "storage_users_delete_own_folder_or_admin" ON storage.objects
FOR DELETE TO authenticated
USING (
  (storage.foldername(name))[1] = auth.uid()::text
  OR public.current_user_role() = 'super_admin'
);
