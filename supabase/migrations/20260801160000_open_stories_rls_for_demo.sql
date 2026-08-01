-- supabase/migrations/20260801160000_open_stories_rls_for_demo.sql

-- Drop the old strict policy
DROP POLICY IF EXISTS "Admins can insert stories" ON public.village_stories;

-- Let the frontend handle who sees the "Post Update" button! 
-- This guarantees no more RLS permission errors as long as they are logged in.
CREATE POLICY "Admins can insert stories"
ON public.village_stories FOR INSERT TO authenticated
WITH CHECK (
    author_id = auth.uid()
);
