-- supabase/migrations/20260801170000_fix_stories_village_id_nullable.sql

-- 1. Make village_id nullable so users without a village_id can still post stories
ALTER TABLE public.village_stories
ALTER COLUMN village_id DROP NOT NULL;

-- 2. Make sure the storage insert policy covers the 'events' bucket for authenticated users
DROP POLICY IF EXISTS "storage_authenticated_upload_project_buckets" ON storage.objects;

CREATE POLICY "storage_authenticated_upload_project_buckets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('profile-images', 'complaints', 'government-works', 'products', 'events', 'documents', 'shop-images')
);

-- 3. Ensure the final RLS on village_stories allows any authenticated user to insert their own stories
DROP POLICY IF EXISTS "Admins can insert stories" ON public.village_stories;

CREATE POLICY "Admins can insert stories"
ON public.village_stories FOR INSERT TO authenticated
WITH CHECK (
    author_id = auth.uid()
);
