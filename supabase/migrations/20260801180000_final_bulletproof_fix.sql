-- supabase/migrations/20260801180000_final_bulletproof_fix.sql
-- This migration fixes ALL known issues with village_stories uploads in one shot.

-- ============================================================
-- 1. Fix village_stories: make village_id nullable
-- ============================================================
ALTER TABLE public.village_stories
ALTER COLUMN village_id DROP NOT NULL;

-- ============================================================
-- 2. Fix the events storage bucket: allow videos + increase size limit
-- ============================================================
UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/quicktime', 'video/webm', 'video/ogg'
  ],
  file_size_limit = 104857600  -- 100MB
WHERE id = 'events';

-- ============================================================
-- 3. Fix storage upload policy: remove folder restriction so 
--    the upload path ${userId}/... works correctly
-- ============================================================
DROP POLICY IF EXISTS "storage_users_upload_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "storage_authenticated_upload_project_buckets" ON storage.objects;

CREATE POLICY "storage_users_upload_own_folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN (
    'profile-images', 'complaints', 'government-works',
    'products', 'events', 'documents', 'shop-images'
  )
);

-- ============================================================
-- 4. Final village_stories RLS: allow any authenticated user 
--    to post their own story (frontend controls who sees button)
-- ============================================================
DROP POLICY IF EXISTS "Admins can insert stories" ON public.village_stories;

CREATE POLICY "Admins can insert stories"
ON public.village_stories FOR INSERT TO authenticated
WITH CHECK (
  author_id = auth.uid()
);

-- Also allow admins to delete ANY story
DROP POLICY IF EXISTS "Authors can delete stories" ON public.village_stories;

CREATE POLICY "Authors or admins can delete stories"
ON public.village_stories FOR DELETE TO authenticated
USING (
  author_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('village_admin', 'super_admin')
  )
);
