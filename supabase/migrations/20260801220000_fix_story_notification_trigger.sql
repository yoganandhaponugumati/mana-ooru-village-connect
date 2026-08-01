-- supabase/migrations/20260801220000_fix_story_notification_trigger.sql
-- Fix the notify_new_village_story trigger to match push_events schema and never block inserts on error

CREATE OR REPLACE FUNCTION public.notify_new_village_story()
RETURNS trigger AS $$
BEGIN
  BEGIN
    -- Correctly insert into push_events schema (event_key, created_by)
    INSERT INTO public.push_events (event_key, created_by)
    VALUES (
      'story_' || NEW.id::text,
      NEW.author_id
    )
    ON CONFLICT (event_key) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Exception guard: Notification failure must NEVER block story creation
    NULL;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
