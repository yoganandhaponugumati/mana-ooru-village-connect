-- ManaOoru: Production auth system support
-- Adds username (unique, case-insensitive), profile-completion tracking,
-- and persisted language preference. Follows existing conventions.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'en'
    CHECK (preferred_language IN ('te', 'en', 'hi')),
  ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMPTZ;

-- Case-insensitive uniqueness: "Ravi" and "ravi" must not both be takeable.
-- Partial index (WHERE username IS NOT NULL) so NULL usernames (pre-completion
-- accounts) never collide with each other.
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_unique
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

-- Basic shape guard: 3-20 chars, lowercase letters/numbers/underscore.
-- The app also validates client-side; this is the source-of-truth guard.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_username_format_check,
  ADD CONSTRAINT profiles_username_format_check CHECK (
    username IS NULL OR username ~ '^[a-z0-9_]{3,20}$'
  );

CREATE INDEX IF NOT EXISTS idx_profiles_profile_completed_at ON public.profiles (profile_completed_at);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
