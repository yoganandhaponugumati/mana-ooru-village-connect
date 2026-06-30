CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role_v2') THEN
    CREATE TYPE public.app_role_v2 AS ENUM ('super_admin', 'village_admin', 'citizen');
  END IF;
END $$;

DROP POLICY IF EXISTS "Owners or admins can delete" ON public.listings;
DROP POLICY IF EXISTS "listings_update_owner_or_admin" ON public.listings;
DROP POLICY IF EXISTS "listings_delete_owner_or_admin" ON public.listings;
DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "villages_admin_write" ON public.villages;
DROP POLICY IF EXISTS "complaints_select_related" ON public.complaints;
DROP POLICY IF EXISTS "complaints_citizen_insert_own" ON public.complaints;
DROP POLICY IF EXISTS "complaints_citizen_update_own_or_official" ON public.complaints;
DROP POLICY IF EXISTS "complaints_citizen_update_own_or_admin" ON public.complaints;
DROP POLICY IF EXISTS "complaints_delete_owner_or_admin" ON public.complaints;
DROP POLICY IF EXISTS "complaints_delete_owner_or_super_admin" ON public.complaints;
DROP POLICY IF EXISTS "announcements_official_write" ON public.announcements;
DROP POLICY IF EXISTS "announcements_admin_write" ON public.announcements;
DROP POLICY IF EXISTS "government_works_official_write" ON public.government_works;
DROP POLICY IF EXISTS "government_works_admin_write" ON public.government_works;
DROP POLICY IF EXISTS "complaint_images_select_related" ON public.complaint_images;
DROP POLICY IF EXISTS "complaint_images_insert_owner" ON public.complaint_images;
DROP POLICY IF EXISTS "complaint_images_delete_owner_or_admin" ON public.complaint_images;
DROP POLICY IF EXISTS "government_work_images_select_public" ON public.government_work_images;
DROP POLICY IF EXISTS "government_work_images_official_write" ON public.government_work_images;
DROP POLICY IF EXISTS "notifications_select_recipient" ON public.notifications;
DROP POLICY IF EXISTS "notifications_official_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_recipient_or_admin" ON public.notifications;
DROP POLICY IF EXISTS "events_manage_own_official_or_admin" ON public.events;
DROP POLICY IF EXISTS "events_manage_own_or_admin" ON public.events;
DROP POLICY IF EXISTS "comments_manage_own_or_admin" ON public.comments;
DROP POLICY IF EXISTS "comments_manage_own_or_super_admin" ON public.comments;
DROP POLICY IF EXISTS "likes_manage_own_or_admin" ON public.likes;
DROP POLICY IF EXISTS "likes_manage_own_or_super_admin" ON public.likes;
DROP POLICY IF EXISTS "products_farmer_manage_own" ON public.products;
DROP POLICY IF EXISTS "jobs_manage_own_or_admin" ON public.jobs;
DROP POLICY IF EXISTS "storage_users_update_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "storage_users_delete_own_folder_or_admin" ON storage.objects;

DROP TRIGGER IF EXISTS trg_profiles_protect_role_changes ON public.profiles;
DROP TRIGGER IF EXISTS trg_profiles_sync_user_role ON public.profiles;

DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_super_admin();
DROP FUNCTION IF EXISTS public.has_role(UUID, public.app_role);
DROP FUNCTION IF EXISTS public.current_user_role();
DROP FUNCTION IF EXISTS public.sync_user_role();
DROP FUNCTION IF EXISTS public.protect_profile_role_changes();

ALTER TABLE IF EXISTS public.user_roles
  ALTER COLUMN role TYPE public.app_role_v2
  USING (
    CASE role::TEXT
      WHEN 'admin' THEN 'super_admin'
      WHEN 'official' THEN 'village_admin'
      WHEN 'moderator' THEN 'village_admin'
      ELSE 'citizen'
    END
  )::public.app_role_v2;

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS role public.app_role_v2 DEFAULT 'citizen',
  ADD COLUMN IF NOT EXISTS occupation TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS village_id UUID;

ALTER TABLE IF EXISTS public.profiles
  ALTER COLUMN role DROP DEFAULT;

ALTER TABLE IF EXISTS public.profiles
  ALTER COLUMN role TYPE public.app_role_v2
  USING (
    CASE role::TEXT
      WHEN 'admin' THEN 'super_admin'
      WHEN 'official' THEN 'village_admin'
      WHEN 'moderator' THEN 'village_admin'
      ELSE 'citizen'
    END
  )::public.app_role_v2,
  ALTER COLUMN role SET DEFAULT 'citizen',
  ALTER COLUMN role SET NOT NULL;

UPDATE public.profiles
SET
  full_name = COALESCE(full_name, display_name),
  photo_url = COALESCE(photo_url, avatar_url),
  occupation = CASE
    WHEN occupation IS NOT NULL THEN occupation
    WHEN account_type IN ('farmer', 'worker') THEN initcap(account_type)
    ELSE occupation
  END,
  account_type = CASE
    WHEN role = 'super_admin' THEN 'app_admin'
    WHEN role = 'village_admin' THEN 'village_admin'
    ELSE 'villager'
  END;

DROP TYPE IF EXISTS public.app_role;
ALTER TYPE public.app_role_v2 RENAME TO app_role;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_occupation_check,
  ADD CONSTRAINT profiles_occupation_check CHECK (
    occupation IS NULL OR occupation IN (
      'Farmer', 'Worker', 'Teacher', 'Student', 'Electrician',
      'Mechanic', 'Doctor', 'Business', 'Other'
    )
  );

CREATE TABLE IF NOT EXISTS public.villages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mandal TEXT,
  district TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, mandal, district, state)
);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_village_id_fkey,
  ADD CONSTRAINT profiles_village_id_fkey FOREIGN KEY (village_id) REFERENCES public.villages(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'rejected')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  location TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS assigned_admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.government_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  budget NUMERIC(14, 2),
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'paused', 'cancelled')),
  start_date DATE,
  end_date DATE,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  village_id UUID REFERENCES public.villages(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('complaint', 'announcement', 'government_work', 'event', 'listing')),
  entity_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('complaint', 'announcement', 'government_work', 'event', 'listing')),
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_occupation ON public.profiles (occupation);
CREATE INDEX IF NOT EXISTS idx_profiles_village_id ON public.profiles (village_id);
CREATE INDEX IF NOT EXISTS idx_villages_location ON public.villages (state, district, mandal, name);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON public.complaints (citizen_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_village_status ON public.complaints (village_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_village ON public.announcements (village_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_government_works_village ON public.government_works (village_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications (recipient_id, read_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_village_date ON public.events (village_id, event_date);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments (entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_entity ON public.likes (entity_type, entity_id);

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), 'citizen'::public.app_role)
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

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_roles WHERE user_id = NEW.id;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, NEW.role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_profile_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND auth.uid() = NEW.id AND NOT public.is_super_admin() THEN
    NEW.role := 'citizen'::public.app_role;
    NEW.account_type := 'villager';
  END IF;

  IF TG_OP = 'UPDATE'
     AND auth.uid() = NEW.id
     AND NOT public.is_super_admin()
     AND (NEW.role IS DISTINCT FROM OLD.role OR NEW.account_type IS DISTINCT FROM OLD.account_type) THEN
    NEW.role := OLD.role;
    NEW.account_type := OLD.account_type;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_protect_role_changes ON public.profiles;
CREATE TRIGGER trg_profiles_protect_role_changes
BEFORE INSERT OR UPDATE OF role, account_type ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role_changes();

DROP TRIGGER IF EXISTS trg_profiles_sync_user_role ON public.profiles;
CREATE TRIGGER trg_profiles_sync_user_role
AFTER INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_user_role();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, display_name, email, phone, occupation, photo_url, avatar_url,
    address, bio, account_type, role, state, district, mandal, village
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'occupation',
    COALESCE(NEW.raw_user_meta_data->>'photo_url', NEW.raw_user_meta_data->>'avatar_url'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'photo_url'),
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'bio',
    'villager',
    'citizen',
    NEW.raw_user_meta_data->>'state',
    NEW.raw_user_meta_data->>'district',
    NEW.raw_user_meta_data->>'mandal',
    NEW.raw_user_meta_data->>'village'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    occupation = COALESCE(EXCLUDED.occupation, public.profiles.occupation),
    photo_url = COALESCE(EXCLUDED.photo_url, public.profiles.photo_url),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    address = COALESCE(EXCLUDED.address, public.profiles.address),
    bio = COALESCE(EXCLUDED.bio, public.profiles.bio),
    state = COALESCE(EXCLUDED.state, public.profiles.state),
    district = COALESCE(EXCLUDED.district, public.profiles.district),
    mandal = COALESCE(EXCLUDED.mandal, public.profiles.mandal),
    village = COALESCE(EXCLUDED.village, public.profiles.village),
    updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'villages', 'profiles', 'complaints', 'announcements',
    'government_works', 'notifications', 'events', 'comments', 'likes'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_self_or_admin" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.is_super_admin())
WITH CHECK (auth.uid() = id OR public.is_super_admin());

DROP POLICY IF EXISTS "villages_select_public" ON public.villages;
DROP POLICY IF EXISTS "villages_admin_write" ON public.villages;
CREATE POLICY "villages_select_public" ON public.villages FOR SELECT USING (true);
CREATE POLICY "villages_admin_write" ON public.villages
FOR ALL TO authenticated
USING (public.current_user_role() IN ('super_admin', 'village_admin'))
WITH CHECK (public.current_user_role() IN ('super_admin', 'village_admin'));

DROP POLICY IF EXISTS "complaints_select_related" ON public.complaints;
DROP POLICY IF EXISTS "complaints_citizen_insert_own" ON public.complaints;
DROP POLICY IF EXISTS "complaints_citizen_update_own_or_official" ON public.complaints;
DROP POLICY IF EXISTS "complaints_delete_owner_or_admin" ON public.complaints;
CREATE POLICY "complaints_select_related" ON public.complaints
FOR SELECT TO authenticated
USING (citizen_id = auth.uid() OR public.current_user_role() IN ('super_admin', 'village_admin'));
CREATE POLICY "complaints_citizen_insert_own" ON public.complaints
FOR INSERT TO authenticated
WITH CHECK (citizen_id = auth.uid());
CREATE POLICY "complaints_citizen_update_own_or_admin" ON public.complaints
FOR UPDATE TO authenticated
USING (citizen_id = auth.uid() OR public.current_user_role() IN ('super_admin', 'village_admin'))
WITH CHECK (citizen_id = auth.uid() OR public.current_user_role() IN ('super_admin', 'village_admin'));
CREATE POLICY "complaints_delete_owner_or_super_admin" ON public.complaints
FOR DELETE TO authenticated
USING (citizen_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "announcements_select_public" ON public.announcements;
DROP POLICY IF EXISTS "announcements_official_write" ON public.announcements;
CREATE POLICY "announcements_select_public" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "announcements_admin_write" ON public.announcements
FOR ALL TO authenticated
USING (author_id = auth.uid() AND public.current_user_role() IN ('super_admin', 'village_admin'))
WITH CHECK (author_id = auth.uid() AND public.current_user_role() IN ('super_admin', 'village_admin'));

DROP POLICY IF EXISTS "government_works_select_public" ON public.government_works;
DROP POLICY IF EXISTS "government_works_official_write" ON public.government_works;
CREATE POLICY "government_works_select_public" ON public.government_works FOR SELECT USING (true);
CREATE POLICY "government_works_admin_write" ON public.government_works
FOR ALL TO authenticated
USING (created_by = auth.uid() AND public.current_user_role() IN ('super_admin', 'village_admin'))
WITH CHECK (created_by = auth.uid() AND public.current_user_role() IN ('super_admin', 'village_admin'));

DROP POLICY IF EXISTS "complaint_images_select_related" ON public.complaint_images;
DROP POLICY IF EXISTS "complaint_images_insert_owner" ON public.complaint_images;
DROP POLICY IF EXISTS "complaint_images_delete_owner_or_admin" ON public.complaint_images;
CREATE POLICY "complaint_images_select_related" ON public.complaint_images
FOR SELECT TO authenticated
USING (uploaded_by = auth.uid() OR public.current_user_role() IN ('super_admin', 'village_admin'));
CREATE POLICY "complaint_images_insert_owner" ON public.complaint_images
FOR INSERT TO authenticated
WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "complaint_images_delete_owner_or_super_admin" ON public.complaint_images
FOR DELETE TO authenticated
USING (uploaded_by = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "government_work_images_select_public" ON public.government_work_images;
DROP POLICY IF EXISTS "government_work_images_official_write" ON public.government_work_images;
CREATE POLICY "government_work_images_select_public" ON public.government_work_images FOR SELECT USING (true);
CREATE POLICY "government_work_images_admin_write" ON public.government_work_images
FOR ALL TO authenticated
USING (uploaded_by = auth.uid() AND public.current_user_role() IN ('super_admin', 'village_admin'))
WITH CHECK (uploaded_by = auth.uid() AND public.current_user_role() IN ('super_admin', 'village_admin'));

DROP POLICY IF EXISTS "notifications_select_recipient" ON public.notifications;
DROP POLICY IF EXISTS "notifications_official_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_recipient_or_admin" ON public.notifications;
CREATE POLICY "notifications_select_recipient" ON public.notifications
FOR SELECT TO authenticated
USING (recipient_id = auth.uid() OR public.current_user_role() IN ('super_admin', 'village_admin'));
CREATE POLICY "notifications_admin_insert" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (public.current_user_role() IN ('super_admin', 'village_admin'));
CREATE POLICY "notifications_update_recipient_or_admin" ON public.notifications
FOR UPDATE TO authenticated
USING (recipient_id = auth.uid() OR public.current_user_role() IN ('super_admin', 'village_admin'))
WITH CHECK (recipient_id = auth.uid() OR public.current_user_role() IN ('super_admin', 'village_admin'));

DROP POLICY IF EXISTS "events_select_public" ON public.events;
DROP POLICY IF EXISTS "events_manage_own_official_or_admin" ON public.events;
CREATE POLICY "events_select_public" ON public.events FOR SELECT USING (true);
CREATE POLICY "events_manage_own_or_admin" ON public.events
FOR ALL TO authenticated
USING (created_by = auth.uid() OR public.current_user_role() IN ('super_admin', 'village_admin'))
WITH CHECK (created_by = auth.uid() OR public.current_user_role() IN ('super_admin', 'village_admin'));

DROP POLICY IF EXISTS "comments_select_public" ON public.comments;
DROP POLICY IF EXISTS "comments_manage_own_or_admin" ON public.comments;
CREATE POLICY "comments_select_public" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_manage_own_or_super_admin" ON public.comments
FOR ALL TO authenticated
USING (author_id = auth.uid() OR public.is_super_admin())
WITH CHECK (author_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "likes_select_public" ON public.likes;
DROP POLICY IF EXISTS "likes_manage_own_or_admin" ON public.likes;
CREATE POLICY "likes_select_public" ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes_manage_own_or_super_admin" ON public.likes
FOR ALL TO authenticated
USING (user_id = auth.uid() OR public.is_super_admin())
WITH CHECK (user_id = auth.uid() OR public.is_super_admin());

DROP POLICY IF EXISTS "listings_select_public" ON public.listings;
DROP POLICY IF EXISTS "listings_insert_authenticated" ON public.listings;
DROP POLICY IF EXISTS "listings_update_owner_or_admin" ON public.listings;
DROP POLICY IF EXISTS "listings_delete_owner_or_admin" ON public.listings;
CREATE POLICY "listings_select_public" ON public.listings FOR SELECT USING (true);
CREATE POLICY "listings_insert_authenticated" ON public.listings
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "listings_update_owner_or_admin" ON public.listings
FOR UPDATE TO authenticated
USING (auth.uid() = owner_id OR public.is_super_admin())
WITH CHECK (auth.uid() = owner_id OR public.is_super_admin());
CREATE POLICY "listings_delete_owner_or_admin" ON public.listings
FOR DELETE TO authenticated
USING (auth.uid() = owner_id OR public.is_super_admin());

DROP POLICY IF EXISTS "products_select_public" ON public.products;
CREATE POLICY "products_select_public" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "jobs_select_public" ON public.jobs;
CREATE POLICY "jobs_select_public" ON public.jobs FOR SELECT USING (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('profile-images', 'profile-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('complaints', 'complaints', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('government-works', 'government-works', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('products', 'products', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('events', 'events', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "storage_public_read_project_buckets" ON storage.objects;
DROP POLICY IF EXISTS "storage_users_upload_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "storage_users_update_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "storage_users_delete_own_folder_or_admin" ON storage.objects;
CREATE POLICY "storage_public_read_project_buckets" ON storage.objects
FOR SELECT USING (
  bucket_id IN ('profile-images', 'complaints', 'government-works', 'products', 'events')
  OR (bucket_id = 'documents' AND auth.role() = 'authenticated')
);
CREATE POLICY "storage_users_upload_own_folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('profile-images', 'complaints', 'government-works', 'products', 'events', 'documents')
  AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "storage_users_update_own_folder" ON storage.objects
FOR UPDATE TO authenticated
USING ((storage.foldername(name))[1] = auth.uid()::text OR public.is_super_admin())
WITH CHECK ((storage.foldername(name))[1] = auth.uid()::text OR public.is_super_admin());
CREATE POLICY "storage_users_delete_own_folder_or_admin" ON storage.objects
FOR DELETE TO authenticated
USING ((storage.foldername(name))[1] = auth.uid()::text OR public.is_super_admin());

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
