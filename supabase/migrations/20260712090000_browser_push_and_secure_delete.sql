ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS entity_type TEXT,
ADD COLUMN IF NOT EXISTS entity_id UUID,
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS dedupe_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_dedupe_key
ON public.notifications (dedupe_key)
WHERE dedupe_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_entity
ON public.notifications (entity_type, entity_id);

CREATE TABLE IF NOT EXISTS public.push_events (
  event_key TEXT PRIMARY KEY,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.push_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_events_admin_only" ON public.push_events;
CREATE POLICY "push_events_admin_only" ON public.push_events
FOR ALL TO authenticated
USING (public.current_user_role() = 'super_admin')
WITH CHECK (public.current_user_role() = 'super_admin');

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "push_subscriptions_select_own" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_insert_own" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_update_own" ON public.push_subscriptions;
DROP POLICY IF EXISTS "push_subscriptions_delete_own" ON public.push_subscriptions;

CREATE POLICY "push_subscriptions_select_own" ON public.push_subscriptions
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.current_user_role() = 'super_admin');

CREATE POLICY "push_subscriptions_insert_own" ON public.push_subscriptions
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "push_subscriptions_update_own" ON public.push_subscriptions
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "push_subscriptions_delete_own" ON public.push_subscriptions
FOR DELETE TO authenticated
USING (user_id = auth.uid() OR public.current_user_role() = 'super_admin');

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications
FOR DELETE TO authenticated
USING (recipient_id = auth.uid() OR public.current_user_role() = 'super_admin');

CREATE OR REPLACE FUNCTION public.notify_all_users_on_listing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  author_name TEXT;
BEGIN
  SELECT COALESCE(NULLIF(profiles.username, ''), NULLIF(profiles.full_name, ''), 'Someone')
  INTO author_name
  FROM public.profiles
  WHERE profiles.id = NEW.owner_id;

  INSERT INTO public.notifications (
    recipient_id,
    village_id,
    created_by,
    title,
    body,
    type,
    entity_type,
    entity_id,
    action_url,
    dedupe_key
  )
  SELECT
    profiles.id,
    profiles.village_id,
    NEW.owner_id,
    '📢 New Post',
    COALESCE(author_name, 'Someone') || ' has posted: ' || NEW.title,
    'new_post',
    'listing',
    NEW.id,
    CASE NEW.type
      WHEN 'worker' THEN '/workers'
      WHEN 'work' THEN '/work'
      WHEN 'land' THEN '/land'
      WHEN 'market' THEN '/marketplace'
      WHEN 'service' THEN '/services'
      WHEN 'announcement' THEN '/announcements'
      WHEN 'complaint' THEN '/problems'
      ELSE '/'
    END || '?post=' || NEW.id::TEXT,
    'new_post:' || NEW.id::TEXT || ':' || profiles.id::TEXT
  FROM public.profiles
  WHERE profiles.id IS NOT NULL
  ON CONFLICT (dedupe_key) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_all_users_on_listing ON public.listings;
CREATE TRIGGER trg_notify_all_users_on_listing
AFTER INSERT ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.notify_all_users_on_listing();

CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id UUID;
  actor_name TEXT;
  item_title TEXT;
BEGIN
  IF NEW.entity_type <> 'listing' THEN
    RETURN NEW;
  END IF;

  SELECT listings.owner_id, listings.title INTO owner_id, item_title
  FROM public.listings
  WHERE listings.id = NEW.entity_id;

  IF owner_id IS NULL OR owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(NULLIF(username, ''), NULLIF(full_name, ''), 'Someone') INTO actor_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  INSERT INTO public.notifications (
    recipient_id, created_by, title, body, type, entity_type, entity_id, action_url, dedupe_key
  )
  VALUES (
    owner_id,
    NEW.user_id,
    'New like',
    COALESCE(actor_name, 'Someone') || ' liked your post: ' || COALESCE(item_title, 'Untitled post'),
    'post_like',
    NEW.entity_type,
    NEW.entity_id,
    '/profile',
    'post_like:' || NEW.id::TEXT
  )
  ON CONFLICT (dedupe_key) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_like ON public.likes;
CREATE TRIGGER trg_notify_on_like
AFTER INSERT ON public.likes
FOR EACH ROW EXECUTE FUNCTION public.notify_on_like();

CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id UUID;
  actor_name TEXT;
  item_title TEXT;
BEGIN
  IF NEW.entity_type <> 'listing' THEN
    RETURN NEW;
  END IF;

  SELECT listings.owner_id, listings.title INTO owner_id, item_title
  FROM public.listings
  WHERE listings.id = NEW.entity_id;

  IF owner_id IS NULL OR owner_id = NEW.author_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(NULLIF(username, ''), NULLIF(full_name, ''), 'Someone') INTO actor_name
  FROM public.profiles
  WHERE id = NEW.author_id;

  INSERT INTO public.notifications (
    recipient_id, created_by, title, body, type, entity_type, entity_id, action_url, dedupe_key
  )
  VALUES (
    owner_id,
    NEW.author_id,
    'New comment',
    COALESCE(actor_name, 'Someone') || ' commented on your post: ' || COALESCE(item_title, 'Untitled post'),
    'post_comment',
    NEW.entity_type,
    NEW.entity_id,
    '/profile',
    'post_comment:' || NEW.id::TEXT
  )
  ON CONFLICT (dedupe_key) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_comment ON public.comments;
CREATE TRIGGER trg_notify_on_comment
AFTER INSERT ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.notify_on_comment();
