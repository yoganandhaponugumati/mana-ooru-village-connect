ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_listings_type_pinned_created
ON public.listings (type, is_pinned DESC, created_at DESC);

DROP POLICY IF EXISTS "listings_update_owner_or_admin" ON public.listings;
CREATE POLICY "listings_update_owner_or_admin" ON public.listings
FOR UPDATE TO authenticated
USING (auth.uid() = owner_id OR public.current_user_role() IN ('village_admin', 'super_admin'))
WITH CHECK (auth.uid() = owner_id OR public.current_user_role() IN ('village_admin', 'super_admin'));
