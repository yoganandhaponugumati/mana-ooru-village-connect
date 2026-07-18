
-- Villages
CREATE TABLE IF NOT EXISTS public.villages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  district text,
  state text,
  mandal text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS villages_name_key ON public.villages (lower(name));
GRANT SELECT ON public.villages TO authenticated;
GRANT ALL ON public.villages TO service_role;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can view villages" ON public.villages;
CREATE POLICY "Authenticated can view villages" ON public.villages
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Super admins manage villages" ON public.villages;
CREATE POLICY "Super admins manage villages" ON public.villages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Profiles extensions
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role app_role NOT NULL DEFAULT 'citizen',
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'villager',
  ADD COLUMN IF NOT EXISTS username text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS occupation text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS mandal text,
  ADD COLUMN IF NOT EXISTS village_id uuid REFERENCES public.villages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS preferred_language text,
  ADD COLUMN IF NOT EXISTS profile_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS dealer_status text,
  ADD COLUMN IF NOT EXISTS dealer_category text,
  ADD COLUMN IF NOT EXISTS shop_name text,
  ADD COLUMN IF NOT EXISTS shop_description text,
  ADD COLUMN IF NOT EXISTS shop_address text,
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS designation text;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key
  ON public.profiles (lower(username)) WHERE username IS NOT NULL;

-- Listings extensions
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS village_id uuid REFERENCES public.villages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS storage_path text;

-- Push subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own push subs" ON public.push_subscriptions;
CREATE POLICY "Users manage own push subs" ON public.push_subscriptions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Push events (dedupe)
CREATE TABLE IF NOT EXISTS public.push_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_key text NOT NULL UNIQUE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.push_events TO authenticated;
GRANT ALL ON public.push_events TO service_role;
ALTER TABLE public.push_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users create own push events" ON public.push_events;
CREATE POLICY "Users create own push events" ON public.push_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "Users read own push events" ON public.push_events;
CREATE POLICY "Users read own push events" ON public.push_events
  FOR SELECT TO authenticated USING (auth.uid() = created_by);
