-- supabase/migrations/20260801150000_fix_stories_rls_for_sarpanch.sql

-- Drop the old policy
DROP POLICY IF EXISTS "Admins can insert stories" ON public.village_stories;

-- Recreate policy to include Sarpanch designation
CREATE POLICY "Admins can insert stories"
ON public.village_stories FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND (
            profiles.role = 'village_admin' 
            OR profiles.role = 'super_admin'
            OR profiles.designation ILIKE '%Sarpanch%'
        )
    )
);
