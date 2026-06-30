ALTER TYPE public.listing_type ADD VALUE IF NOT EXISTS 'complaint';

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS storage_path TEXT;

CREATE INDEX IF NOT EXISTS idx_listings_type_created ON public.listings (type, created_at DESC);
