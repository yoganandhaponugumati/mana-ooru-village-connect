CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_listings_village_type_created
ON public.listings (village_id, type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_listings_village_pinned_created
ON public.listings (village_id, is_pinned DESC, created_at DESC);

UPDATE public.listings
SET village_id = profiles.village_id
FROM public.profiles
WHERE public.listings.owner_id = profiles.id
  AND public.listings.village_id IS NULL
  AND profiles.village_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.current_user_village_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT village_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.same_village_or_super_admin(_village_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role() = 'super_admin'::public.app_role
    OR _village_id IS NULL
    OR _village_id = public.current_user_village_id()
$$;

CREATE TABLE IF NOT EXISTS public.timeline_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id UUID REFERENCES public.villages(id) ON DELETE CASCADE,
  source_table TEXT NOT NULL,
  source_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (
    activity_type IN (
      'government_work', 'announcement', 'complaint', 'complaint_resolved',
      'marketplace', 'worker', 'service', 'village_shop', 'festival', 'emergency',
      'lost_found', 'agriculture', 'weather_alert', 'meeting', 'event',
      'education', 'healthcare', 'volunteer', 'road_work', 'water',
      'electricity', 'temple', 'general_update'
    )
  ),
  title TEXT NOT NULL,
  body TEXT,
  image_url TEXT,
  action_url TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_emergency BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source_table, source_id, activity_type, created_at)
);

CREATE TABLE IF NOT EXISTS public.timeline_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timeline_activity_id UUID NOT NULL REFERENCES public.timeline_activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL DEFAULT 'like' CHECK (reaction IN ('like', 'support', 'thanks', 'important')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (timeline_activity_id, user_id, reaction)
);

CREATE TABLE IF NOT EXISTS public.timeline_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timeline_activity_id UUID NOT NULL REFERENCES public.timeline_activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (timeline_activity_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.timeline_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timeline_activity_id UUID NOT NULL REFERENCES public.timeline_activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (timeline_activity_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.timeline_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timeline_activity_id UUID NOT NULL REFERENCES public.timeline_activities(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'dismissed', 'actioned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_timeline_village_pinned_created
ON public.timeline_activities (village_id, is_emergency DESC, is_pinned DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_timeline_type_created
ON public.timeline_activities (activity_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_timeline_source
ON public.timeline_activities (source_table, source_id);

CREATE INDEX IF NOT EXISTS idx_timeline_reactions_activity
ON public.timeline_reactions (timeline_activity_id, reaction);

CREATE INDEX IF NOT EXISTS idx_timeline_reports_activity
ON public.timeline_reports (timeline_activity_id, status);

ALTER TABLE public.timeline_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "timeline_select_same_village" ON public.timeline_activities;
CREATE POLICY "timeline_select_same_village" ON public.timeline_activities
FOR SELECT TO authenticated
USING (public.same_village_or_super_admin(village_id));

DROP POLICY IF EXISTS "timeline_admin_insert" ON public.timeline_activities;
CREATE POLICY "timeline_admin_insert" ON public.timeline_activities
FOR INSERT TO authenticated
WITH CHECK (
  public.current_user_role() IN ('super_admin', 'village_admin')
  AND public.same_village_or_super_admin(village_id)
);

DROP POLICY IF EXISTS "timeline_admin_update" ON public.timeline_activities;
CREATE POLICY "timeline_admin_update" ON public.timeline_activities
FOR UPDATE TO authenticated
USING (
  public.current_user_role() IN ('super_admin', 'village_admin')
  AND public.same_village_or_super_admin(village_id)
)
WITH CHECK (
  public.current_user_role() IN ('super_admin', 'village_admin')
  AND public.same_village_or_super_admin(village_id)
);

DROP POLICY IF EXISTS "timeline_super_admin_delete" ON public.timeline_activities;
CREATE POLICY "timeline_super_admin_delete" ON public.timeline_activities
FOR DELETE TO authenticated
USING (public.current_user_role() = 'super_admin');

DROP POLICY IF EXISTS "timeline_reactions_same_village" ON public.timeline_reactions;
CREATE POLICY "timeline_reactions_same_village" ON public.timeline_reactions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.timeline_activities ta
    WHERE ta.id = timeline_activity_id
      AND public.same_village_or_super_admin(ta.village_id)
  )
);

DROP POLICY IF EXISTS "timeline_reactions_own_write" ON public.timeline_reactions;
CREATE POLICY "timeline_reactions_own_write" ON public.timeline_reactions
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.timeline_activities ta
    WHERE ta.id = timeline_activity_id
      AND public.same_village_or_super_admin(ta.village_id)
  )
);

DROP POLICY IF EXISTS "timeline_saves_own" ON public.timeline_saves;
CREATE POLICY "timeline_saves_own" ON public.timeline_saves
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.timeline_activities ta
    WHERE ta.id = timeline_activity_id
      AND public.same_village_or_super_admin(ta.village_id)
  )
);

DROP POLICY IF EXISTS "timeline_follows_own" ON public.timeline_follows;
CREATE POLICY "timeline_follows_own" ON public.timeline_follows
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.timeline_activities ta
    WHERE ta.id = timeline_activity_id
      AND public.same_village_or_super_admin(ta.village_id)
  )
);

DROP POLICY IF EXISTS "timeline_reports_own_or_admin" ON public.timeline_reports;
CREATE POLICY "timeline_reports_own_or_admin" ON public.timeline_reports
FOR ALL TO authenticated
USING (
  reporter_id = auth.uid()
  OR public.current_user_role() IN ('super_admin', 'village_admin')
)
WITH CHECK (
  reporter_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.timeline_activities ta
    WHERE ta.id = timeline_activity_id
      AND public.same_village_or_super_admin(ta.village_id)
  )
);

DROP POLICY IF EXISTS "listings_select_same_village" ON public.listings;
DROP POLICY IF EXISTS "listings_select_public" ON public.listings;
CREATE POLICY "listings_select_same_village" ON public.listings
FOR SELECT TO authenticated
USING (public.same_village_or_super_admin(village_id));

DROP POLICY IF EXISTS "listings_insert_authenticated" ON public.listings;
CREATE POLICY "listings_insert_authenticated" ON public.listings
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = owner_id
  AND COALESCE(village_id, public.current_user_village_id()) = public.current_user_village_id()
);

DROP POLICY IF EXISTS "listings_update_owner_or_admin" ON public.listings;
CREATE POLICY "listings_update_owner_or_admin" ON public.listings
FOR UPDATE TO authenticated
USING (
  auth.uid() = owner_id
  OR public.current_user_role() = 'super_admin'
  OR (public.current_user_role() = 'village_admin' AND village_id = public.current_user_village_id())
)
WITH CHECK (
  auth.uid() = owner_id
  OR public.current_user_role() = 'super_admin'
  OR (public.current_user_role() = 'village_admin' AND village_id = public.current_user_village_id())
);

DROP POLICY IF EXISTS "announcements_select_public" ON public.announcements;
DROP POLICY IF EXISTS "announcements_select_same_village" ON public.announcements;
CREATE POLICY "announcements_select_same_village" ON public.announcements
FOR SELECT TO authenticated
USING (public.same_village_or_super_admin(village_id));

DROP POLICY IF EXISTS "government_works_select_public" ON public.government_works;
DROP POLICY IF EXISTS "government_works_select_same_village" ON public.government_works;
CREATE POLICY "government_works_select_same_village" ON public.government_works
FOR SELECT TO authenticated
USING (public.same_village_or_super_admin(village_id));

DROP POLICY IF EXISTS "events_select_public" ON public.events;
DROP POLICY IF EXISTS "events_select_same_village" ON public.events;
CREATE POLICY "events_select_same_village" ON public.events
FOR SELECT TO authenticated
USING (public.same_village_or_super_admin(village_id));

CREATE OR REPLACE FUNCTION public.set_listing_village_from_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.village_id IS NULL THEN
    SELECT village_id INTO NEW.village_id
    FROM public.profiles
    WHERE id = NEW.owner_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_listing_village_from_owner ON public.listings;
CREATE TRIGGER trg_set_listing_village_from_owner
BEFORE INSERT OR UPDATE OF owner_id, village_id ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.set_listing_village_from_owner();

CREATE OR REPLACE FUNCTION public.timeline_type_for_listing(_type TEXT, _category TEXT, _title TEXT, _description TEXT, _status TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  haystack TEXT := lower(coalesce(_title, '') || ' ' || coalesce(_description, '') || ' ' || coalesce(_category, ''));
BEGIN
  IF _type = 'worker' THEN RETURN 'worker'; END IF;
  IF _type = 'market' THEN RETURN 'marketplace'; END IF;
  IF _type = 'service' AND coalesce(_category, '') IN ('Kirana', 'Medical', 'Bakery', 'Hotel', 'Tea Stall', 'Mobile Shop', 'Hardware', 'Fertilizer', 'Seeds', 'Dairy') THEN
    RETURN 'village_shop';
  END IF;
  IF _type = 'service' THEN RETURN 'service'; END IF;
  IF _type = 'complaint' AND _status IN ('completed', 'resolved') THEN RETURN 'complaint_resolved'; END IF;
  IF _type = 'complaint' THEN RETURN 'complaint'; END IF;
  IF _type = 'announcement' THEN
    IF haystack ~ '(emergency|urgent|flood|missing|danger|medical emergency|water contamination|power failure)' THEN RETURN 'emergency'; END IF;
    IF haystack ~ '(festival|temple|jatara)' THEN RETURN 'festival'; END IF;
    IF haystack ~ '(school|holiday|education|exam)' THEN RETURN 'education'; END IF;
    IF haystack ~ '(health|vaccination|blood|camp)' THEN RETURN 'healthcare'; END IF;
    IF haystack ~ '(meeting|gram sabha)' THEN RETURN 'meeting'; END IF;
    IF haystack ~ '(water|tank|drainage)' THEN RETURN 'water'; END IF;
    IF haystack ~ '(electric|power|current|street light|streetlight)' THEN RETURN 'electricity'; END IF;
    RETURN 'announcement';
  END IF;
  RETURN 'general_update';
END;
$$;

CREATE OR REPLACE FUNCTION public.timeline_action_for_listing(_type TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT CASE _type
    WHEN 'worker' THEN '/workers'
    WHEN 'work' THEN '/work'
    WHEN 'land' THEN '/land'
    WHEN 'market' THEN '/marketplace'
    WHEN 'service' THEN '/services'
    WHEN 'announcement' THEN '/announcements'
    WHEN 'complaint' THEN '/problems'
    ELSE '/timeline'
  END
$$;

CREATE OR REPLACE FUNCTION public.upsert_listing_timeline_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  timeline_type TEXT;
  author_name TEXT;
BEGIN
  timeline_type := public.timeline_type_for_listing(NEW.type::TEXT, NEW.category, NEW.title, NEW.description, NEW.status);

  SELECT COALESCE(NULLIF(username, ''), NULLIF(full_name, ''), 'Village member')
  INTO author_name
  FROM public.profiles
  WHERE id = NEW.owner_id;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.timeline_activities (
      village_id, source_table, source_id, activity_type, title, body, image_url,
      action_url, author_id, is_pinned, is_emergency, verified, metadata, created_at
    )
    VALUES (
      NEW.village_id,
      'listings',
      NEW.id,
      timeline_type,
      CASE
        WHEN timeline_type = 'worker' THEN 'Worker available: ' || NEW.title
        WHEN timeline_type = 'marketplace' THEN 'Marketplace item added: ' || NEW.title
        WHEN timeline_type = 'village_shop' THEN 'New shop opened: ' || NEW.title
        WHEN timeline_type = 'service' THEN 'Service registered: ' || NEW.title
        WHEN timeline_type = 'complaint_resolved' THEN 'Complaint resolved: ' || NEW.title
        WHEN timeline_type = 'complaint' THEN 'Complaint reported: ' || NEW.title
        ELSE NEW.title
      END,
      COALESCE(NULLIF(NEW.description, ''), NULLIF(NEW.category, ''), 'New village activity posted.'),
      NEW.image_url,
      public.timeline_action_for_listing(NEW.type::TEXT) || '?post=' || NEW.id::TEXT,
      NEW.owner_id,
      COALESCE(NEW.is_pinned, false),
      timeline_type = 'emergency',
      NEW.type = 'announcement',
      jsonb_build_object('listing_type', NEW.type, 'category', NEW.category, 'status', NEW.status, 'author_name', author_name),
      COALESCE(NEW.created_at, now())
    );
  ELSIF NEW.is_pinned IS DISTINCT FROM OLD.is_pinned THEN
    UPDATE public.timeline_activities
    SET is_pinned = COALESCE(NEW.is_pinned, false),
        updated_at = now()
    WHERE source_table = 'listings'
      AND source_id = NEW.id;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.timeline_activities (
      village_id, source_table, source_id, activity_type, title, body, image_url,
      action_url, author_id, is_pinned, is_emergency, verified, metadata
    )
    VALUES (
      NEW.village_id,
      'listings',
      NEW.id,
      public.timeline_type_for_listing(NEW.type::TEXT, NEW.category, NEW.title, NEW.description, NEW.status),
      CASE
        WHEN NEW.type = 'complaint' AND NEW.status IN ('completed', 'resolved') THEN 'Complaint resolved: ' || NEW.title
        WHEN NEW.type = 'complaint' THEN 'Complaint status updated: ' || NEW.title
        ELSE 'Status updated: ' || NEW.title
      END,
      'Status changed from ' || COALESCE(OLD.status, 'new') || ' to ' || COALESCE(NEW.status, 'active') || '.',
      NEW.image_url,
      public.timeline_action_for_listing(NEW.type::TEXT) || '?post=' || NEW.id::TEXT,
      NEW.owner_id,
      COALESCE(NEW.is_pinned, false),
      false,
      NEW.type = 'announcement',
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_upsert_listing_timeline_activity ON public.listings;
CREATE TRIGGER trg_upsert_listing_timeline_activity
AFTER INSERT OR UPDATE OF status, is_pinned ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.upsert_listing_timeline_activity();

CREATE OR REPLACE FUNCTION public.insert_government_work_timeline_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  timeline_type TEXT := CASE WHEN lower(NEW.title) ~ '(road|street)' THEN 'road_work' ELSE 'government_work' END;
  progress_label TEXT := CASE NEW.status
    WHEN 'planned' THEN '0%'
    WHEN 'active' THEN '50%'
    WHEN 'paused' THEN '75%'
    WHEN 'completed' THEN '100%'
    ELSE '25%'
  END;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.timeline_activities (
      village_id, source_table, source_id, activity_type, title, body, action_url,
      author_id, is_pinned, verified, metadata, created_at
    )
    VALUES (
      NEW.village_id,
      'government_works',
      NEW.id,
      timeline_type,
      CASE WHEN NEW.status = 'completed' THEN 'Government work completed: ' ELSE 'Government work update: ' END || NEW.title,
      COALESCE(NEW.description, COALESCE(NEW.department, 'Panchayat') || ' work is ' || NEW.status || '.'),
      '/official?work=' || NEW.id::TEXT,
      NEW.created_by,
      NEW.status IN ('active', 'paused'),
      true,
      jsonb_build_object('status', NEW.status, 'department', NEW.department, 'progress', progress_label, 'budget', NEW.budget),
      COALESCE(NEW.created_at, now())
    );
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.timeline_activities (
      village_id, source_table, source_id, activity_type, title, body, action_url,
      author_id, is_pinned, verified, metadata
    )
    VALUES (
      NEW.village_id,
      'government_works',
      NEW.id,
      timeline_type,
      'Government work progress ' || progress_label || ': ' || NEW.title,
      'Progress changed from ' || OLD.status || ' to ' || NEW.status || '.',
      '/official?work=' || NEW.id::TEXT,
      NEW.created_by,
      NEW.status IN ('active', 'paused'),
      true,
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status, 'progress', progress_label)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_government_work_timeline_activity ON public.government_works;
CREATE TRIGGER trg_government_work_timeline_activity
AFTER INSERT OR UPDATE OF status ON public.government_works
FOR EACH ROW EXECUTE FUNCTION public.insert_government_work_timeline_activity();

CREATE OR REPLACE FUNCTION public.notify_village_on_timeline_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
  WHERE profiles.village_id IS NOT DISTINCT FROM NEW.village_id
     OR public.current_user_role() = 'super_admin'
  ON CONFLICT (dedupe_key) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_village_on_timeline_activity ON public.timeline_activities;
CREATE TRIGGER trg_notify_village_on_timeline_activity
AFTER INSERT ON public.timeline_activities
FOR EACH ROW EXECUTE FUNCTION public.notify_village_on_timeline_activity();

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
  WHERE profiles.village_id IS NOT DISTINCT FROM NEW.village_id
  ON CONFLICT (dedupe_key) DO NOTHING;

  RETURN NEW;
END;
$$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.timeline_activities, public.timeline_reactions,
  public.timeline_saves, public.timeline_follows, public.timeline_reports TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_village_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.same_village_or_super_admin(UUID) TO authenticated;
