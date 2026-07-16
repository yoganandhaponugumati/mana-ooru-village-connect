-- ============================================================================
-- 20260715170000_final_hardening_and_conflict_fix.sql
-- Final hardening of unique indexes, ON CONFLICT targets, and triggers.
-- ============================================================================

-- 1. Ensure idx_notifications_dedupe_key is a non-partial unique index so ON CONFLICT (dedupe_key) matches cleanly
DROP INDEX IF EXISTS public.idx_notifications_dedupe_key;
CREATE UNIQUE INDEX idx_notifications_dedupe_key ON public.notifications (dedupe_key);

-- 2. Ensure notify_village_on_timeline_activity uses safe ON CONFLICT
CREATE OR REPLACE FUNCTION public.notify_village_on_timeline_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  activity_type_label TEXT;
  target_url TEXT;
BEGIN
  IF NEW.village_id IS NULL THEN
    RETURN NEW;
  END IF;

  target_url := COALESCE(NEW.action_url, '/timeline?activity=' || NEW.id::TEXT);
  activity_type_label := CASE
    WHEN NEW.is_emergency THEN 'Emergency alert'
    WHEN NEW.activity_type = 'complaint' THEN 'Village issue report'
    WHEN NEW.activity_type = 'announcement' THEN 'Village announcement'
    ELSE 'Village timeline update'
  END;

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
    NEW.village_id,
    NEW.author_id,
    activity_type_label,
    NEW.title,
    CASE WHEN NEW.is_emergency THEN 'timeline_emergency' ELSE 'timeline_activity' END,
    'timeline_activity',
    NEW.id,
    target_url,
    'timeline:' || NEW.id::TEXT || ':' || profiles.id::TEXT
  FROM public.profiles
  WHERE profiles.village_id = NEW.village_id
  ON CONFLICT (dedupe_key) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 3. Ensure notify_all_users_on_listing uses safe ON CONFLICT
CREATE OR REPLACE FUNCTION public.notify_all_users_on_listing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  author_name TEXT;
BEGIN
  IF NEW.village_id IS NULL THEN
    RETURN NEW;
  END IF;

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
    NEW.village_id,
    NEW.owner_id,
    'New village post',
    COALESCE(author_name, 'Someone') || ' has posted: ' || NEW.title,
    'new_post',
    'listing',
    NEW.id,
    public.timeline_action_for_listing(NEW.type::TEXT) || '?post=' || NEW.id::TEXT,
    'new_post:' || NEW.id::TEXT || ':' || profiles.id::TEXT
  FROM public.profiles
  WHERE profiles.village_id = NEW.village_id
  ON CONFLICT (dedupe_key) DO NOTHING;

  RETURN NEW;
END;
$$;
