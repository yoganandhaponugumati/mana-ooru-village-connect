-- supabase/migrations/20260731200000_stories_and_trust.sql

-- 1. Add Trust Scores and Verified Badges to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 50;

-- 2. Create Village Stories Table
CREATE TABLE IF NOT EXISTS public.village_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    village_id UUID NOT NULL,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Index for querying active stories fast
CREATE INDEX IF NOT EXISTS idx_village_stories_active ON public.village_stories(village_id, expires_at) WHERE expires_at > NOW();

-- Enable RLS
ALTER TABLE public.village_stories ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can read stories for their village (or globally if we want cross-village viewing)
CREATE POLICY "Anyone can read stories"
ON public.village_stories
FOR SELECT
USING (true);

-- Policy 2: Only village_admins or super_admins can insert stories
CREATE POLICY "Admins can insert stories"
ON public.village_stories
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND (profiles.role = 'village_admin' OR profiles.role = 'super_admin')
    )
);

-- Policy 3: Authors can delete their own stories
CREATE POLICY "Authors can delete stories"
ON public.village_stories
FOR DELETE
TO authenticated
USING (author_id = auth.uid());
