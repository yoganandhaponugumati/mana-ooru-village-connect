CREATE OR REPLACE FUNCTION public.notify_all_users_on_listing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  listing_label TEXT := CASE NEW.type
    WHEN 'worker' THEN 'worker profile'
    WHEN 'work' THEN 'work request'
    WHEN 'land' THEN 'land listing'
    WHEN 'market' THEN 'market listing'
    WHEN 'service' THEN 'service listing'
    WHEN 'announcement' THEN 'announcement'
    WHEN 'complaint' THEN 'problem report'
    ELSE 'village update'
  END;
BEGIN
  INSERT INTO public.notifications (recipient_id, village_id, created_by, title, body, type)
  SELECT
    profiles.id,
    profiles.village_id,
    NEW.owner_id,
    'New ' || listing_label || ' posted',
    NEW.title || COALESCE(' - ' || NULLIF(NEW.location, ''), ''),
    'listing_' || NEW.type::TEXT
  FROM public.profiles
  WHERE profiles.id IS NOT NULL;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_all_users_on_listing ON public.listings;
CREATE TRIGGER trg_notify_all_users_on_listing
AFTER INSERT ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.notify_all_users_on_listing();

CREATE OR REPLACE FUNCTION public.notify_new_user_welcome()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, village_id, created_by, title, body, type)
  VALUES (
    NEW.id,
    NEW.village_id,
    NEW.id,
    'Welcome to ManaOoru',
    'You will receive village posts, work, market, land, service, notice, and problem updates here.',
    'welcome'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_new_user_welcome ON public.profiles;
CREATE TRIGGER trg_notify_new_user_welcome
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.notify_new_user_welcome();

DROP POLICY IF EXISTS "notifications_select_recipient" ON public.notifications;
DROP POLICY IF EXISTS "notifications_official_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_recipient_or_admin" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_own_or_broadcast" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_system_or_self" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;

CREATE POLICY "notifications_select_own_or_broadcast" ON public.notifications
FOR SELECT TO authenticated
USING (recipient_id = auth.uid() OR recipient_id IS NULL OR public.current_user_role() IN ('village_admin', 'super_admin'));

CREATE POLICY "notifications_insert_system_or_self" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (
  recipient_id = auth.uid()
  OR public.current_user_role() IN ('village_admin', 'super_admin')
);

CREATE POLICY "notifications_update_own" ON public.notifications
FOR UPDATE TO authenticated
USING (recipient_id = auth.uid() OR public.current_user_role() = 'super_admin')
WITH CHECK (recipient_id = auth.uid() OR public.current_user_role() = 'super_admin');

CREATE INDEX IF NOT EXISTS idx_notifications_unread_recipient
ON public.notifications (recipient_id, read_at, created_at DESC);
