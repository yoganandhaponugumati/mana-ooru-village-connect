-- supabase/migrations/20260801140000_moderation_and_triggers.sql

-- 1. Rate Limiting Function
CREATE OR REPLACE FUNCTION public.check_rate_limit()
RETURNS trigger AS $$
DECLARE
  post_count INTEGER;
BEGIN
  IF TG_TABLE_NAME = 'events' THEN
    SELECT COUNT(*) INTO post_count
    FROM public.events
    WHERE created_by = NEW.created_by
    AND created_at > (NOW() - INTERVAL '5 minutes');
    
    IF post_count >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded: You can only post 5 items per 5 minutes.';
    END IF;
  ELSIF TG_TABLE_NAME = 'village_stories' THEN
    SELECT COUNT(*) INTO post_count
    FROM public.village_stories
    WHERE author_id = NEW.author_id
    AND created_at > (NOW() - INTERVAL '5 minutes');
    
    IF post_count >= 5 THEN
      RAISE EXCEPTION 'Rate limit exceeded: You can only post 5 stories per 5 minutes.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Apply Rate Limit Triggers
DROP TRIGGER IF EXISTS trg_rate_limit_events ON public.events;
CREATE TRIGGER trg_rate_limit_events
BEFORE INSERT ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.check_rate_limit();

DROP TRIGGER IF EXISTS trg_rate_limit_stories ON public.village_stories;
CREATE TRIGGER trg_rate_limit_stories
BEFORE INSERT ON public.village_stories
FOR EACH ROW
EXECUTE FUNCTION public.check_rate_limit();

-- 3. Notifications Trigger for Village Stories
CREATE OR REPLACE FUNCTION public.notify_new_village_story()
RETURNS trigger AS $$
BEGIN
  -- Insert into push_events so Edge Function/Client can send notification
  INSERT INTO public.push_events (village_id, user_id, title, body, type, action_url)
  VALUES (
    NEW.village_id,
    NEW.author_id,
    'New Village Story',
    'A new update was posted in your village!',
    'story',
    '/timeline'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_new_story ON public.village_stories;
CREATE TRIGGER trg_notify_new_story
AFTER INSERT ON public.village_stories
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_village_story();

-- 4. Deletion Security Update for Village Admins
-- Update 'events' delete policy
DROP POLICY IF EXISTS "events_delete_owner_or_super_admin" ON public.events;
DROP POLICY IF EXISTS "events_delete_owner_or_admins" ON public.events;
CREATE POLICY "events_delete_owner_or_admins" ON public.events
FOR DELETE TO authenticated
USING (
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'village_admin')
  )
);

-- Update 'village_stories' delete policy
DROP POLICY IF EXISTS "Authors can delete stories" ON public.village_stories;
DROP POLICY IF EXISTS "Authors and admins can delete stories" ON public.village_stories;
CREATE POLICY "Authors and admins can delete stories" ON public.village_stories
FOR DELETE TO authenticated
USING (
  author_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('super_admin', 'village_admin')
  )
);
