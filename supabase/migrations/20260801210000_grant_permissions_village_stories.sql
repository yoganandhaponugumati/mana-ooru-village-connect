-- supabase/migrations/20260801210000_grant_permissions_village_stories.sql
-- Grant table permissions to authenticated, anon, and service_role for village_stories

GRANT ALL ON public.village_stories TO authenticated, anon, service_role;

-- Ensure RLS is either disabled or open
ALTER TABLE public.village_stories DISABLE ROW LEVEL SECURITY;
