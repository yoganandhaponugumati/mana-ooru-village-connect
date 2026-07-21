-- ============================================================================
-- 20260721220000_add_official_response_to_listings.sql
-- Adds official_response column to listings and complaints tables so Gram Panchayat / Sarpanch
-- can add reasoning, status notes, or explanations when civic reports are updated or escalated.
-- ============================================================================

ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS official_response TEXT;
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS official_response TEXT;

-- Allow Village Admins (Sarpanch) and Super Admins to update status and official_response on listings in their village
DROP POLICY IF EXISTS "listings_update_owner_or_super_admin" ON public.listings;
CREATE POLICY "listings_update_owner_or_admin" ON public.listings FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR public.is_super_admin() OR (public.current_user_role() = 'village_admin'::public.app_role AND (village_id IS NULL OR public.same_village_as_caller(village_id))))
  WITH CHECK (auth.uid() = owner_id OR public.is_super_admin() OR (public.current_user_role() = 'village_admin'::public.app_role AND (village_id IS NULL OR public.same_village_as_caller(village_id))));

DROP POLICY IF EXISTS "complaints_update_owner_or_super_admin" ON public.complaints;
CREATE POLICY "complaints_update_owner_or_admin" ON public.complaints FOR UPDATE TO authenticated
  USING (citizen_id = auth.uid() OR public.is_super_admin() OR (public.current_user_role() = 'village_admin'::public.app_role AND (village_id IS NULL OR public.same_village_as_caller(village_id))))
  WITH CHECK (citizen_id = auth.uid() OR public.is_super_admin() OR (public.current_user_role() = 'village_admin'::public.app_role AND (village_id IS NULL OR public.same_village_as_caller(village_id))));
