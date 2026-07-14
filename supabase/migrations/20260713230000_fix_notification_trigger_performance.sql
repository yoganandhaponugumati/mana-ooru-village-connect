-- ============================================================================
-- ManaOoru — Self-Contained 4-Role Auth, Trigger & Security Consolidated Fixes
-- ============================================================================
-- 1. Alters types and adds profile columns if missed.
-- 2. Declares all core helper functions (same_village_as_caller, is_super_admin, etc.).
-- 3. Sets up the village_id auto-resolver trigger.
-- 4. Optimizes notification triggers.
-- 5. Wipes and resets clean RLS policies for Listings, Activities, Notifications, and Villages.
-- ============================================================================

-- A. Extend the app_role enum with 'dealer'
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'dealer';

-- B. Add columns to profiles if missing
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS designation TEXT,
  ADD COLUMN IF NOT EXISTS dealer_status TEXT DEFAULT NULL
    CHECK (dealer_status IS NULL OR dealer_status IN ('pending', 'approved', 'suspended', 'rejected')),
  ADD COLUMN IF NOT EXISTS dealer_category TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS shop_name TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS shop_description TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS shop_address TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ DEFAULT NULL;

-- C. Helper Functions
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'citizen'::public.app_role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role() = 'super_admin'::public.app_role
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role() IN ('super_admin'::public.app_role, 'village_admin'::public.app_role)
$$;

CREATE OR REPLACE FUNCTION public.caller_village_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT village_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.same_village_as_caller(_village_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_super_admin()
    OR (
      _village_id IS NOT NULL
      AND _village_id = public.caller_village_id()
    )
$$;

CREATE OR REPLACE FUNCTION public.is_approved_dealer()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role::text = 'dealer'
      AND dealer_status = 'approved'
  )
$$;

CREATE OR REPLACE FUNCTION public.same_village_or_super_admin(_village_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_super_admin()
    OR _village_id IS NULL
    OR _village_id = public.caller_village_id()
$$;

-- D. Profile Location to village_id Resolution Trigger
CREATE OR REPLACE FUNCTION public.resolve_profile_village_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_id UUID;
BEGIN
  IF NEW.village IS NOT NULL AND NEW.district IS NOT NULL AND NEW.state IS NOT NULL THEN
    -- Try to find existing village (case-insensitive)
    SELECT id INTO resolved_id
    FROM public.villages
    WHERE lower(name) = lower(NEW.village)
      AND lower(coalesce(mandal, '')) = lower(coalesce(NEW.mandal, ''))
      AND lower(district) = lower(NEW.district)
      AND lower(state) = lower(NEW.state)
    LIMIT 1;

    -- If not found, insert a new village entry
    IF resolved_id IS NULL THEN
      INSERT INTO public.villages (name, mandal, district, state)
      VALUES (NEW.village, NEW.mandal, NEW.district, NEW.state)
      ON CONFLICT (name, mandal, district, state) DO UPDATE
        SET name = EXCLUDED.name -- dummy update to trigger RETURNING
      RETURNING id INTO resolved_id;
    END IF;

    -- Assign resolved village_id
    NEW.village_id := resolved_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_resolve_village_id ON public.profiles;
CREATE TRIGGER trg_profiles_resolve_village_id
BEFORE INSERT OR UPDATE OF state, district, mandal, village ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.resolve_profile_village_id();

-- Sync all existing profiles' village_ids who have location details
UPDATE public.profiles p
SET village_id = (
  SELECT id FROM public.villages v
  WHERE lower(v.name) = lower(p.village)
    AND lower(coalesce(v.mandal, '')) = lower(coalesce(p.mandal, ''))
    AND lower(v.district) = lower(p.district)
    AND lower(v.state) = lower(p.state)
  LIMIT 1
)
WHERE p.village_id IS NULL AND p.village IS NOT NULL AND p.district IS NOT NULL AND p.state IS NOT NULL;

-- Sync all existing listings' village_ids from owners
UPDATE public.listings l
SET village_id = p.village_id
FROM public.profiles p
WHERE l.owner_id = p.id
  AND l.village_id IS NULL
  AND p.village_id IS NOT NULL;

-- E. Optimize notify_village_on_timeline_activity()
CREATE OR REPLACE FUNCTION public.notify_village_on_timeline_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.village_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (
    recipient_id, village_id, created_by, title, body, type,
    entity_type, entity_id, action_url, dedupe_key
  )
  SELECT
    profiles.id,
    NEW.village_id,
    NEW.author_id,
    CASE WHEN NEW.is_emergency THEN 'Emergency alert' ELSE 'Village timeline update' END,
    NEW.title,
    CASE WHEN NEW.is_emergency THEN 'timeline_emergency' ELSE 'timeline_activity' END,
    'timeline_activity',
    NEW.id,
    COALESCE(NEW.action_url, '/timeline?activity=' || NEW.id::TEXT),
    'timeline:' || NEW.id::TEXT || ':' || profiles.id::TEXT
  FROM public.profiles
  WHERE profiles.village_id = NEW.village_id
  ON CONFLICT (dedupe_key) DO NOTHING;

  RETURN NEW;
END;
$$;

-- F. Optimize notify_all_users_on_listing()
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

-- G. Rebuild all LISTINGS policies
DROP POLICY IF EXISTS "Listings are public to read" ON public.listings;
DROP POLICY IF EXISTS "Authenticated can create listings" ON public.listings;
DROP POLICY IF EXISTS "Owners can update their listings" ON public.listings;
DROP POLICY IF EXISTS "Owners or admins can delete" ON public.listings;
DROP POLICY IF EXISTS "listings_select_public" ON public.listings;
DROP POLICY IF EXISTS "listings_select_same_village" ON public.listings;
DROP POLICY IF EXISTS "listings_insert_authenticated" ON public.listings;
DROP POLICY IF EXISTS "listings_update_owner_or_admin" ON public.listings;
DROP POLICY IF EXISTS "listings_update_owner_or_super_admin" ON public.listings;
DROP POLICY IF EXISTS "listings_delete_owner_or_admin" ON public.listings;
DROP POLICY IF EXISTS "listings_delete_owner_or_super_admin" ON public.listings;

CREATE POLICY "listings_select_public" ON public.listings FOR SELECT USING (true);
CREATE POLICY "listings_insert_authenticated" ON public.listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "listings_update_owner_or_super_admin" ON public.listings FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.is_super_admin()) WITH CHECK (auth.uid() = owner_id OR public.is_super_admin());
CREATE POLICY "listings_delete_owner_or_super_admin" ON public.listings FOR DELETE TO authenticated USING (auth.uid() = owner_id OR public.is_super_admin());

-- H. Rebuild all TIMELINE_ACTIVITIES policies
DROP POLICY IF EXISTS "timeline_select_same_village" ON public.timeline_activities;
DROP POLICY IF EXISTS "timeline_admin_insert" ON public.timeline_activities;
DROP POLICY IF EXISTS "timeline_citizen_insert" ON public.timeline_activities;
DROP POLICY IF EXISTS "timeline_admin_update" ON public.timeline_activities;
DROP POLICY IF EXISTS "timeline_super_admin_delete" ON public.timeline_activities;

CREATE POLICY "timeline_select_same_village" ON public.timeline_activities FOR SELECT TO authenticated USING (public.same_village_or_super_admin(village_id));
CREATE POLICY "timeline_admin_insert" ON public.timeline_activities FOR INSERT TO authenticated WITH CHECK (public.current_user_role() IN ('super_admin', 'village_admin') AND public.same_village_or_super_admin(village_id));
CREATE POLICY "timeline_citizen_insert" ON public.timeline_activities FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "timeline_admin_update" ON public.timeline_activities FOR UPDATE TO authenticated USING (public.current_user_role() IN ('super_admin', 'village_admin') AND public.same_village_or_super_admin(village_id)) WITH CHECK (public.current_user_role() IN ('super_admin', 'village_admin') AND public.same_village_or_super_admin(village_id));
CREATE POLICY "timeline_super_admin_delete" ON public.timeline_activities FOR DELETE TO authenticated USING (public.is_super_admin());

-- I. Rebuild all NOTIFICATIONS policies
DROP POLICY IF EXISTS "notifications_select_recipient" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_user_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_recipient_or_admin" ON public.notifications;

CREATE POLICY "notifications_select_recipient" ON public.notifications FOR SELECT TO authenticated USING (recipient_id = auth.uid() OR public.is_super_admin() OR (public.current_user_role() = 'village_admin'::public.app_role AND public.same_village_as_caller(village_id)));
CREATE POLICY "notifications_admin_insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "notifications_user_insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "notifications_update_recipient_or_admin" ON public.notifications FOR UPDATE TO authenticated USING (recipient_id = auth.uid() OR public.is_super_admin()) WITH CHECK (recipient_id = auth.uid() OR public.is_super_admin());

-- J. Rebuild all VILLAGES policies (Allows authenticated creation during location picker triggers)
DROP POLICY IF EXISTS "villages_select_public" ON public.villages;
DROP POLICY IF EXISTS "villages_super_admin_insert" ON public.villages;
DROP POLICY IF EXISTS "villages_insert_authenticated" ON public.villages;
DROP POLICY IF EXISTS "villages_super_admin_update" ON public.villages;
DROP POLICY IF EXISTS "villages_super_admin_delete" ON public.villages;

CREATE POLICY "villages_select_public" ON public.villages FOR SELECT USING (true);
CREATE POLICY "villages_insert_authenticated" ON public.villages FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "villages_super_admin_update" ON public.villages FOR UPDATE TO authenticated USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());
CREATE POLICY "villages_super_admin_delete" ON public.villages FOR DELETE TO authenticated USING (public.is_super_admin());
