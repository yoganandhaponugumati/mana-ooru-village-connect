-- ============================================================================
-- 20260725190000_fix_listings_delete_rls.sql
-- Updates the DELETE policy for public.listings to allow Village Admins (Sarpanch)
-- of the same village to delete listings (notices, marketplace, workers, complaints).
-- ============================================================================

DROP POLICY IF EXISTS "listings_delete_owner_or_super_admin" ON public.listings;

CREATE POLICY "listings_delete_owner_or_admin" ON public.listings FOR DELETE TO authenticated
  USING (
    auth.uid() = owner_id 
    OR public.is_super_admin() 
    OR (
      public.current_user_role() = 'village_admin'::public.app_role 
      AND (
        village_id IS NULL 
        OR public.same_village_as_caller(village_id)
      )
    )
  );
