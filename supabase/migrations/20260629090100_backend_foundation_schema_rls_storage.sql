CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role public.app_role DEFAULT 'citizen',
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS village_id UUID;

UPDATE public.profiles
SET role = CASE
  WHEN account_type = 'app_admin' THEN 'admin'::public.app_role
  WHEN account_type = 'village_admin' THEN 'official'::public.app_role
  WHEN account_type = 'worker' THEN 'worker'::public.app_role
  WHEN account_type = 'farmer' THEN 'farmer'::public.app_role
  ELSE COALESCE(role, 'citizen'::public.app_role)
END
WHERE role IS NULL OR account_type IN ('app_admin', 'village_admin', 'worker', 'farmer');

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
  assigned_official_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  location TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.complaint_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS public.government_work_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  government_work_id UUID NOT NULL REFERENCES public.government_works(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC(12, 2),
  unit TEXT,
  quantity NUMERIC(12, 2),
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  wage TEXT,
  location TEXT,
  starts_on DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  entity_type TEXT NOT NULL CHECK (entity_type IN ('complaint', 'announcement', 'government_work', 'product', 'job', 'event', 'listing')),
  entity_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('complaint', 'announcement', 'government_work', 'product', 'job', 'event', 'listing')),
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_village_id ON public.profiles (village_id);
CREATE INDEX IF NOT EXISTS idx_villages_location ON public.villages (state, district, mandal, name);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON public.complaints (citizen_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaint_images_complaint ON public.complaint_images (complaint_id);
CREATE INDEX IF NOT EXISTS idx_announcements_village ON public.announcements (village_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_government_works_village ON public.government_works (village_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_government_work_images_work ON public.government_work_images (government_work_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications (recipient_id, read_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_farmer ON public.products (farmer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_village ON public.jobs (village_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_village_date ON public.events (village_id, event_date);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments (entity_type, entity_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_entity ON public.likes (entity_type, entity_id);

DROP TRIGGER IF EXISTS trg_villages_updated ON public.villages;
CREATE TRIGGER trg_villages_updated BEFORE UPDATE ON public.villages FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_complaints_updated ON public.complaints;
CREATE TRIGGER trg_complaints_updated BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_announcements_updated ON public.announcements;
CREATE TRIGGER trg_announcements_updated BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_government_works_updated ON public.government_works;
CREATE TRIGGER trg_government_works_updated BEFORE UPDATE ON public.government_works FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_products_updated ON public.products;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_jobs_updated ON public.jobs;
CREATE TRIGGER trg_jobs_updated BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_events_updated ON public.events;
CREATE TRIGGER trg_events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS trg_comments_updated ON public.comments;
CREATE TRIGGER trg_comments_updated BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

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

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role() = 'admin'::public.app_role
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _user_id AND role = _role
  )
  OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE(NEW.role, 'citizen'::public.app_role))
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
  IF TG_OP = 'INSERT'
     AND auth.uid() = NEW.id
     AND NOT public.is_admin()
     AND NEW.role IN ('official', 'admin') THEN
    NEW.role := 'citizen'::public.app_role;
    NEW.account_type := 'villager';
  END IF;

  IF TG_OP = 'UPDATE'
     AND auth.uid() = NEW.id
     AND NOT public.is_admin()
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
DECLARE
  requested_role public.app_role := CASE
    WHEN NEW.raw_user_meta_data->>'role' IN ('citizen', 'worker', 'farmer')
      THEN (NEW.raw_user_meta_data->>'role')::public.app_role
    ELSE 'citizen'::public.app_role
  END;
BEGIN
  INSERT INTO public.profiles (
    id, display_name, email, phone, account_type, role, state, district, mandal, village
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    CASE WHEN requested_role = 'admin' THEN 'app_admin'
         WHEN requested_role = 'official' THEN 'village_admin'
         ELSE 'villager'
    END,
    requested_role,
    NEW.raw_user_meta_data->>'state',
    NEW.raw_user_meta_data->>'district',
    NEW.raw_user_meta_data->>'mandal',
    NEW.raw_user_meta_data->>'village'
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    account_type = COALESCE(EXCLUDED.account_type, public.profiles.account_type),
    role = COALESCE(EXCLUDED.role, public.profiles.role),
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
    'villages', 'profiles', 'complaints', 'complaint_images', 'announcements',
    'government_works', 'government_work_images', 'notifications', 'products',
    'jobs', 'events', 'comments', 'likes', 'listings'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_self_or_admin" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "villages_select_public" ON public.villages;
DROP POLICY IF EXISTS "villages_admin_write" ON public.villages;
CREATE POLICY "villages_select_public" ON public.villages FOR SELECT USING (true);
CREATE POLICY "villages_admin_write" ON public.villages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "complaints_select_related" ON public.complaints;
DROP POLICY IF EXISTS "complaints_citizen_insert_own" ON public.complaints;
DROP POLICY IF EXISTS "complaints_citizen_update_own_or_official" ON public.complaints;
DROP POLICY IF EXISTS "complaints_delete_owner_or_admin" ON public.complaints;
CREATE POLICY "complaints_select_related" ON public.complaints
FOR SELECT TO authenticated
USING (citizen_id = auth.uid() OR public.current_user_role() IN ('official', 'admin'));
CREATE POLICY "complaints_citizen_insert_own" ON public.complaints
FOR INSERT TO authenticated
WITH CHECK (citizen_id = auth.uid() AND public.current_user_role() IN ('citizen', 'admin'));
CREATE POLICY "complaints_citizen_update_own_or_official" ON public.complaints
FOR UPDATE TO authenticated
USING (citizen_id = auth.uid() OR public.current_user_role() IN ('official', 'admin'))
WITH CHECK (citizen_id = auth.uid() OR public.current_user_role() IN ('official', 'admin'));
CREATE POLICY "complaints_delete_owner_or_admin" ON public.complaints
FOR DELETE TO authenticated
USING (citizen_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "complaint_images_select_related" ON public.complaint_images;
DROP POLICY IF EXISTS "complaint_images_insert_owner" ON public.complaint_images;
DROP POLICY IF EXISTS "complaint_images_delete_owner_or_admin" ON public.complaint_images;
CREATE POLICY "complaint_images_select_related" ON public.complaint_images
FOR SELECT TO authenticated
USING (uploaded_by = auth.uid() OR public.current_user_role() IN ('official', 'admin'));
CREATE POLICY "complaint_images_insert_owner" ON public.complaint_images
FOR INSERT TO authenticated
WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "complaint_images_delete_owner_or_admin" ON public.complaint_images
FOR DELETE TO authenticated
USING (uploaded_by = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "announcements_select_public" ON public.announcements;
DROP POLICY IF EXISTS "announcements_official_write" ON public.announcements;
CREATE POLICY "announcements_select_public" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "announcements_official_write" ON public.announcements
FOR ALL TO authenticated
USING (author_id = auth.uid() AND public.current_user_role() IN ('official', 'admin') OR public.is_admin())
WITH CHECK (author_id = auth.uid() AND public.current_user_role() IN ('official', 'admin') OR public.is_admin());

DROP POLICY IF EXISTS "government_works_select_public" ON public.government_works;
DROP POLICY IF EXISTS "government_works_official_write" ON public.government_works;
CREATE POLICY "government_works_select_public" ON public.government_works FOR SELECT USING (true);
CREATE POLICY "government_works_official_write" ON public.government_works
FOR ALL TO authenticated
USING (created_by = auth.uid() AND public.current_user_role() IN ('official', 'admin') OR public.is_admin())
WITH CHECK (created_by = auth.uid() AND public.current_user_role() IN ('official', 'admin') OR public.is_admin());

DROP POLICY IF EXISTS "government_work_images_select_public" ON public.government_work_images;
DROP POLICY IF EXISTS "government_work_images_official_write" ON public.government_work_images;
CREATE POLICY "government_work_images_select_public" ON public.government_work_images FOR SELECT USING (true);
CREATE POLICY "government_work_images_official_write" ON public.government_work_images
FOR ALL TO authenticated
USING (uploaded_by = auth.uid() AND public.current_user_role() IN ('official', 'admin') OR public.is_admin())
WITH CHECK (uploaded_by = auth.uid() AND public.current_user_role() IN ('official', 'admin') OR public.is_admin());

DROP POLICY IF EXISTS "notifications_select_recipient" ON public.notifications;
DROP POLICY IF EXISTS "notifications_official_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_recipient_or_admin" ON public.notifications;
CREATE POLICY "notifications_select_recipient" ON public.notifications
FOR SELECT TO authenticated
USING (recipient_id = auth.uid() OR public.current_user_role() IN ('official', 'admin'));
CREATE POLICY "notifications_official_insert" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (public.current_user_role() IN ('official', 'admin'));
CREATE POLICY "notifications_update_recipient_or_admin" ON public.notifications
FOR UPDATE TO authenticated
USING (recipient_id = auth.uid() OR public.is_admin())
WITH CHECK (recipient_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "products_select_public" ON public.products;
DROP POLICY IF EXISTS "products_farmer_manage_own" ON public.products;
CREATE POLICY "products_select_public" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_farmer_manage_own" ON public.products
FOR ALL TO authenticated
USING (farmer_id = auth.uid() AND public.current_user_role() IN ('farmer', 'admin') OR public.is_admin())
WITH CHECK (farmer_id = auth.uid() AND public.current_user_role() IN ('farmer', 'admin') OR public.is_admin());

DROP POLICY IF EXISTS "jobs_select_public" ON public.jobs;
DROP POLICY IF EXISTS "jobs_manage_own_or_admin" ON public.jobs;
CREATE POLICY "jobs_select_public" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "jobs_manage_own_or_admin" ON public.jobs
FOR ALL TO authenticated
USING (posted_by = auth.uid() OR public.is_admin())
WITH CHECK (posted_by = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "events_select_public" ON public.events;
DROP POLICY IF EXISTS "events_manage_own_official_or_admin" ON public.events;
CREATE POLICY "events_select_public" ON public.events FOR SELECT USING (true);
CREATE POLICY "events_manage_own_official_or_admin" ON public.events
FOR ALL TO authenticated
USING (created_by = auth.uid() OR public.current_user_role() IN ('official', 'admin'))
WITH CHECK (created_by = auth.uid() OR public.current_user_role() IN ('official', 'admin'));

DROP POLICY IF EXISTS "comments_select_public" ON public.comments;
DROP POLICY IF EXISTS "comments_manage_own_or_admin" ON public.comments;
CREATE POLICY "comments_select_public" ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_manage_own_or_admin" ON public.comments
FOR ALL TO authenticated
USING (author_id = auth.uid() OR public.is_admin())
WITH CHECK (author_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "likes_select_public" ON public.likes;
DROP POLICY IF EXISTS "likes_manage_own_or_admin" ON public.likes;
CREATE POLICY "likes_select_public" ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes_manage_own_or_admin" ON public.likes
FOR ALL TO authenticated
USING (user_id = auth.uid() OR public.is_admin())
WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Listings are public to read" ON public.listings;
DROP POLICY IF EXISTS "Authenticated can create listings" ON public.listings;
DROP POLICY IF EXISTS "Owners can update their listings" ON public.listings;
DROP POLICY IF EXISTS "Owners or admins can delete" ON public.listings;
DROP POLICY IF EXISTS "listings_select_public" ON public.listings;
DROP POLICY IF EXISTS "listings_insert_authenticated" ON public.listings;
DROP POLICY IF EXISTS "listings_update_owner_or_admin" ON public.listings;
DROP POLICY IF EXISTS "listings_delete_owner_or_admin" ON public.listings;
CREATE POLICY "listings_select_public" ON public.listings FOR SELECT USING (true);
CREATE POLICY "listings_insert_authenticated" ON public.listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "listings_update_owner_or_admin" ON public.listings
FOR UPDATE TO authenticated
USING (auth.uid() = owner_id OR public.is_admin())
WITH CHECK (auth.uid() = owner_id OR public.is_admin());
CREATE POLICY "listings_delete_owner_or_admin" ON public.listings
FOR DELETE TO authenticated
USING (auth.uid() = owner_id OR public.is_admin());

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
USING ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin())
WITH CHECK ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin());
CREATE POLICY "storage_users_delete_own_folder_or_admin" ON storage.objects
FOR DELETE TO authenticated
USING ((storage.foldername(name))[1] = auth.uid()::text OR public.is_admin());

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
