-- Fix listings insert RLS policy for NULL village_ids
DROP POLICY IF EXISTS "listings_insert_authenticated" ON public.listings;
CREATE POLICY "listings_insert_authenticated" ON public.listings
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = owner_id
  AND COALESCE(village_id, public.current_user_village_id()) IS NOT DISTINCT FROM public.current_user_village_id()
);
