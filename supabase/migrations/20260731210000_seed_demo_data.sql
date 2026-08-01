-- Migration: Seed Welcome Announcements for existing and future villages

DO $$
DECLARE
  v_admin_id UUID;
  v_village RECORD;
BEGIN
  -- Get any available user to act as the creator, preferably an admin
  SELECT id INTO v_admin_id FROM public.profiles 
  WHERE role IN ('super_admin', 'village_admin') 
  LIMIT 1;

  -- Fallback to any user if no admin exists
  IF v_admin_id IS NULL THEN
    SELECT id INTO v_admin_id FROM public.profiles LIMIT 1;
  END IF;

  -- If we have at least one user, seed existing villages
  IF v_admin_id IS NOT NULL THEN
    FOR v_village IN SELECT * FROM public.villages LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.listings 
        WHERE type = 'announcement' 
          AND village_id = v_village.id 
          AND title LIKE 'Welcome to ManaOoru%'
      ) THEN
        INSERT INTO public.listings (
          owner_id, type, title, description, category, contact, location, village_id, is_pinned
        ) VALUES (
          v_admin_id, 'announcement', 'Welcome to ManaOoru - ' || v_village.name,
          'Welcome to the official village portal. Stay updated with panchayat announcements, schemes, and community news here. You can post updates and follow community polls on this board.',
          'Panchayat Alert',
          'Panchayat Office',
          v_village.name,
          v_village.id,
          true
        );
      END IF;
    END LOOP;
  END IF;
END $$;

-- Trigger to auto-create announcement for future villages
CREATE OR REPLACE FUNCTION public.seed_village_welcome_announcement()
RETURNS TRIGGER AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- We need an owner for the listing. Try to find an admin, or the first user.
  SELECT id INTO v_admin_id FROM public.profiles 
  WHERE role IN ('super_admin', 'village_admin') 
  LIMIT 1;
  
  IF v_admin_id IS NULL THEN
    SELECT id INTO v_admin_id FROM public.profiles LIMIT 1;
  END IF;

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.listings (
      owner_id, type, title, description, category, contact, location, village_id, is_pinned
    ) VALUES (
      v_admin_id, 'announcement', 'Welcome to ManaOoru - ' || NEW.name,
      'Welcome to the official village portal. Stay updated with panchayat announcements, schemes, and community news here. You can post updates and follow community polls on this board.',
      'Panchayat Alert',
      'Panchayat Office',
      NEW.name,
      NEW.id,
      true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_village_created_seed_announcement ON public.villages;
CREATE TRIGGER on_village_created_seed_announcement
AFTER INSERT ON public.villages
FOR EACH ROW
EXECUTE FUNCTION public.seed_village_welcome_announcement();
