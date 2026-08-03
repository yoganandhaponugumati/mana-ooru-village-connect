-- supabase/migrations/20260803130000_storage_allow_videos.sql
-- Allow video formats and larger file uploads for events/stories storage bucket

UPDATE storage.buckets
SET 
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime', 'video/3gpp'],
  file_size_limit = 52428800 -- 50MB
WHERE id = 'events';

-- Ensure storage RLS policy allows any authenticated user to upload to events bucket
DROP POLICY IF EXISTS "events_storage_insert_policy" ON storage.objects;
CREATE POLICY "events_storage_insert_policy" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'events');

DROP POLICY IF EXISTS "events_storage_select_policy" ON storage.objects;
CREATE POLICY "events_storage_select_policy" ON storage.objects
  FOR SELECT USING (bucket_id = 'events');

DROP POLICY IF EXISTS "events_storage_delete_policy" ON storage.objects;
CREATE POLICY "events_storage_delete_policy" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'events' AND owner = auth.uid());
