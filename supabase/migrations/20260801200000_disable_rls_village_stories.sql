-- supabase/migrations/20260801200000_disable_rls_village_stories.sql
-- Disable RLS on village_stories entirely - frontend handles access control

ALTER TABLE public.village_stories DISABLE ROW LEVEL SECURITY;
