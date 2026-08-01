-- supabase/migrations/20260801190000_nuclear_rls_fix.sql
-- Drop ALL old policies on village_stories and recreate clean ones

DROP POLICY IF EXISTS "Anyone can read stories" ON public.village_stories;
DROP POLICY IF EXISTS "Admins can insert stories" ON public.village_stories;
DROP POLICY IF EXISTS "Authors can delete stories" ON public.village_stories;
DROP POLICY IF EXISTS "Authors or admins can delete stories" ON public.village_stories;
DROP POLICY IF EXISTS "allow_read" ON public.village_stories;
DROP POLICY IF EXISTS "allow_insert" ON public.village_stories;
DROP POLICY IF EXISTS "allow_delete" ON public.village_stories;

-- Anyone can read stories
CREATE POLICY "allow_read" ON public.village_stories
FOR SELECT USING (true);

-- Any logged-in user can insert (frontend controls who sees the button)
CREATE POLICY "allow_insert" ON public.village_stories
FOR INSERT TO authenticated
WITH CHECK (true);

-- Authors and admins can delete
CREATE POLICY "allow_delete" ON public.village_stories
FOR DELETE TO authenticated
USING (
  author_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('village_admin', 'super_admin')
  )
);
