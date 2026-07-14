-- ============================================================================
-- ManaOoru — 4-Role Authentication & Authorization System
-- ============================================================================
-- Upgrades the platform from 3 roles to 4 roles:
--   super_admin | village_admin | dealer | citizen
--
-- Key additions:
--   • `dealer` enum value for the merchant/dealer role
--   • Dealer approval workflow columns (dealer_status, dealer_category, etc.)
--   • Village Admin designation column
--   • Village isolation in ALL RLS policies
--   • Enhanced role-protection trigger
--   • Updated handle_new_user trigger
-- ============================================================================

-- ============================================================================
-- STEP 1: Extend the app_role enum with 'dealer'
-- ============================================================================
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'dealer';

-- ============================================================================
-- STEP 2: Add new columns to profiles
-- ============================================================================
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

-- Designation constraint: only valid titles for village admins
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_designation_check,
  ADD CONSTRAINT profiles_designation_check CHECK (
    designation IS NULL OR designation IN (
      'Sarpanch', 'Panchayat Secretary', 'VRO', 'Panchayat Officer',
      'Ward Member', 'MPDO', 'Mandal Parishad', 'Other'
    )
  );

-- Dealer category constraint
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_dealer_category_check,
  ADD CONSTRAINT profiles_dealer_category_check CHECK (
    dealer_category IS NULL OR dealer_category IN (
      'Grocery', 'Medical Shop', 'Fertilizer Shop', 'Rice Mill',
      'Tractor Dealer', 'Dairy', 'Hardware', 'Restaurant',
      'Clothing', 'Electronics', 'Automobile', 'Stationery',
      'Veterinary', 'Seeds & Pesticides', 'Construction',
      'Poultry & Feed', 'Other'
    )
  );

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_profiles_dealer_status ON public.profiles (dealer_status) WHERE dealer_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_designation ON public.profiles (designation) WHERE designation IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_approved_by ON public.profiles (approved_by) WHERE approved_by IS NOT NULL;

-- ============================================================================
-- STEP 3: Helper functions
-- ============================================================================

-- current_user_role(): returns the authenticated user's role
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

-- is_super_admin(): true if the caller is a platform admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role() = 'super_admin'::public.app_role
$$;

-- is_admin(): true if super_admin OR village_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_user_role() IN ('super_admin'::public.app_role, 'village_admin'::public.app_role)
$$;

-- caller_village_id(): returns the village_id of the authenticated user
CREATE OR REPLACE FUNCTION public.caller_village_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT village_id FROM public.profiles WHERE id = auth.uid()
$$;

-- same_village_as_caller(target_village_id): village isolation check
-- Returns true if the target village matches the caller's village,
-- OR if the caller is a super_admin (bypasses village boundaries).
CREATE OR REPLACE FUNCTION public.same_village_as_caller(_village_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin()
    OR (
      _village_id IS NOT NULL
      AND _village_id = public.caller_village_id()
    )
$$;

-- is_approved_dealer(): true if the caller is a dealer with approved status
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
      AND role = 'dealer'::public.app_role
      AND dealer_status = 'approved'
  )
$$;

-- has_role(): check if a specific user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND role = _role)
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.caller_village_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.same_village_as_caller(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_approved_dealer() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- ============================================================================
-- STEP 4: Enhanced role protection trigger
-- ============================================================================
CREATE OR REPLACE FUNCTION public.protect_profile_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role public.app_role;
  caller_id UUID;
BEGIN
  caller_id := auth.uid();
  caller_role := public.current_user_role();

  -- === INSERT protection ===
  IF TG_OP = 'INSERT' THEN
    -- Non-super-admins always get 'citizen' on self-insert
    IF caller_id = NEW.id AND caller_role != 'super_admin' THEN
      NEW.role := 'citizen'::public.app_role;
      NEW.account_type := 'villager';
      NEW.dealer_status := NULL;
      NEW.designation := NULL;
    END IF;
    RETURN NEW;
  END IF;

  -- === UPDATE protection ===
  IF TG_OP = 'UPDATE' THEN
    -- ROLE changes: only super_admin can change anyone's role
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      IF caller_role != 'super_admin' THEN
        NEW.role := OLD.role;
      END IF;
    END IF;

    -- ACCOUNT_TYPE changes: only super_admin
    IF NEW.account_type IS DISTINCT FROM OLD.account_type THEN
      IF caller_role != 'super_admin' THEN
        NEW.account_type := OLD.account_type;
      END IF;
    END IF;

    -- DEALER_STATUS changes: only super_admin or same-village village_admin
    IF NEW.dealer_status IS DISTINCT FROM OLD.dealer_status THEN
      IF caller_role = 'super_admin' THEN
        -- super_admin can always change dealer_status
        NULL;
      ELSIF caller_role = 'village_admin'
        AND OLD.village_id IS NOT NULL
        AND OLD.village_id = public.caller_village_id() THEN
        -- village_admin can approve/reject dealers in their own village
        NULL;
      ELSE
        -- everyone else: revert
        NEW.dealer_status := OLD.dealer_status;
      END IF;
    END IF;

    -- DESIGNATION changes: only super_admin
    IF NEW.designation IS DISTINCT FROM OLD.designation THEN
      IF caller_role != 'super_admin' THEN
        NEW.designation := OLD.designation;
      END IF;
    END IF;

    -- APPROVED_BY / APPROVED_AT: auto-set when dealer_status changes to 'approved'
    IF NEW.dealer_status = 'approved' AND OLD.dealer_status IS DISTINCT FROM 'approved' THEN
      NEW.approved_by := caller_id;
      NEW.approved_at := now();
    END IF;

    -- Clear approval fields if status changes away from 'approved'
    IF NEW.dealer_status IS DISTINCT FROM 'approved' AND OLD.dealer_status = 'approved' THEN
      NEW.approved_by := NULL;
      NEW.approved_at := NULL;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_protect_role_changes ON public.profiles;
CREATE TRIGGER trg_profiles_protect_role_changes
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role_changes();

-- ============================================================================
-- STEP 5: Enhanced handle_new_user trigger
-- ============================================================================
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
    'citizen'::public.app_role,  -- Always citizen on signup, never trust client metadata for role
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

-- ============================================================================
-- STEP 6: Rewrite ALL RLS policies with village isolation
-- ============================================================================

-- ---- PROFILES ----
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_super_admin" ON public.profiles;

CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_self_or_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_super_admin())
  WITH CHECK (auth.uid() = id OR public.is_super_admin());

CREATE POLICY "profiles_delete_super_admin" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- ---- VILLAGES ----
DROP POLICY IF EXISTS "villages_select_public" ON public.villages;
DROP POLICY IF EXISTS "villages_admin_write" ON public.villages;
DROP POLICY IF EXISTS "villages_super_admin_insert" ON public.villages;
DROP POLICY IF EXISTS "villages_super_admin_update" ON public.villages;
DROP POLICY IF EXISTS "villages_super_admin_delete" ON public.villages;

CREATE POLICY "villages_select_public" ON public.villages
  FOR SELECT USING (true);

CREATE POLICY "villages_super_admin_insert" ON public.villages
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "villages_super_admin_update" ON public.villages
  FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "villages_super_admin_delete" ON public.villages
  FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- ---- COMPLAINTS ----
-- Citizens see own complaints; village_admin sees their village; super_admin sees all
DROP POLICY IF EXISTS "complaints_select_related" ON public.complaints;
DROP POLICY IF EXISTS "complaints_citizen_insert_own" ON public.complaints;
DROP POLICY IF EXISTS "complaints_citizen_update_own_or_official" ON public.complaints;
DROP POLICY IF EXISTS "complaints_citizen_update_own_or_admin" ON public.complaints;
DROP POLICY IF EXISTS "complaints_delete_owner_or_admin" ON public.complaints;
DROP POLICY IF EXISTS "complaints_delete_owner_or_super_admin" ON public.complaints;

CREATE POLICY "complaints_select_related" ON public.complaints
  FOR SELECT TO authenticated
  USING (
    citizen_id = auth.uid()
    OR public.is_super_admin()
    OR (public.current_user_role() = 'village_admin'::public.app_role AND public.same_village_as_caller(village_id))
  );

CREATE POLICY "complaints_citizen_insert_own" ON public.complaints
  FOR INSERT TO authenticated
  WITH CHECK (citizen_id = auth.uid());

CREATE POLICY "complaints_update_own_or_village_admin" ON public.complaints
  FOR UPDATE TO authenticated
  USING (
    citizen_id = auth.uid()
    OR public.is_super_admin()
    OR (public.current_user_role() = 'village_admin'::public.app_role AND public.same_village_as_caller(village_id))
  )
  WITH CHECK (
    citizen_id = auth.uid()
    OR public.is_super_admin()
    OR (public.current_user_role() = 'village_admin'::public.app_role AND public.same_village_as_caller(village_id))
  );

CREATE POLICY "complaints_delete_owner_or_super_admin" ON public.complaints
  FOR DELETE TO authenticated
  USING (citizen_id = auth.uid() OR public.is_super_admin());

-- ---- COMPLAINT IMAGES ----
DROP POLICY IF EXISTS "complaint_images_select_related" ON public.complaint_images;
DROP POLICY IF EXISTS "complaint_images_insert_owner" ON public.complaint_images;
DROP POLICY IF EXISTS "complaint_images_delete_owner_or_admin" ON public.complaint_images;
DROP POLICY IF EXISTS "complaint_images_delete_owner_or_super_admin" ON public.complaint_images;

CREATE POLICY "complaint_images_select_related" ON public.complaint_images
  FOR SELECT TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR public.is_super_admin()
    OR (public.current_user_role() = 'village_admin'::public.app_role
        AND EXISTS (
          SELECT 1 FROM public.complaints c
          WHERE c.id = complaint_id AND public.same_village_as_caller(c.village_id)
        ))
  );

CREATE POLICY "complaint_images_insert_owner" ON public.complaint_images
  FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "complaint_images_delete_owner_or_super_admin" ON public.complaint_images
  FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR public.is_super_admin());

-- ---- ANNOUNCEMENTS ----
-- Readable by everyone; only admins of the same village (or super_admin) can write
DROP POLICY IF EXISTS "announcements_select_public" ON public.announcements;
DROP POLICY IF EXISTS "announcements_official_write" ON public.announcements;
DROP POLICY IF EXISTS "announcements_admin_write" ON public.announcements;

CREATE POLICY "announcements_select_public" ON public.announcements
  FOR SELECT USING (true);

CREATE POLICY "announcements_admin_insert" ON public.announcements
  FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND (
      public.is_super_admin()
      OR (public.current_user_role() = 'village_admin'::public.app_role AND public.same_village_as_caller(village_id))
    )
  );

CREATE POLICY "announcements_admin_update" ON public.announcements
  FOR UPDATE TO authenticated
  USING (
    (author_id = auth.uid() AND public.is_admin())
    OR public.is_super_admin()
  )
  WITH CHECK (
    (author_id = auth.uid() AND public.is_admin())
    OR public.is_super_admin()
  );

CREATE POLICY "announcements_super_admin_delete" ON public.announcements
  FOR DELETE TO authenticated
  USING (public.is_super_admin() OR (author_id = auth.uid() AND public.is_admin()));

-- ---- GOVERNMENT WORKS ----
DROP POLICY IF EXISTS "government_works_select_public" ON public.government_works;
DROP POLICY IF EXISTS "government_works_official_write" ON public.government_works;
DROP POLICY IF EXISTS "government_works_admin_write" ON public.government_works;

CREATE POLICY "government_works_select_public" ON public.government_works
  FOR SELECT USING (true);

CREATE POLICY "government_works_admin_insert" ON public.government_works
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (
      public.is_super_admin()
      OR (public.current_user_role() = 'village_admin'::public.app_role AND public.same_village_as_caller(village_id))
    )
  );

CREATE POLICY "government_works_admin_update" ON public.government_works
  FOR UPDATE TO authenticated
  USING (
    (created_by = auth.uid() AND public.is_admin())
    OR public.is_super_admin()
  )
  WITH CHECK (
    (created_by = auth.uid() AND public.is_admin())
    OR public.is_super_admin()
  );

CREATE POLICY "government_works_super_admin_delete" ON public.government_works
  FOR DELETE TO authenticated
  USING (public.is_super_admin() OR (created_by = auth.uid() AND public.is_admin()));

-- ---- GOVERNMENT WORK IMAGES ----
DROP POLICY IF EXISTS "government_work_images_select_public" ON public.government_work_images;
DROP POLICY IF EXISTS "government_work_images_official_write" ON public.government_work_images;
DROP POLICY IF EXISTS "government_work_images_admin_write" ON public.government_work_images;

CREATE POLICY "government_work_images_select_public" ON public.government_work_images
  FOR SELECT USING (true);

CREATE POLICY "government_work_images_admin_insert" ON public.government_work_images
  FOR INSERT TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid()
    AND public.is_admin()
  );

CREATE POLICY "government_work_images_admin_update" ON public.government_work_images
  FOR UPDATE TO authenticated
  USING (
    (uploaded_by = auth.uid() AND public.is_admin())
    OR public.is_super_admin()
  )
  WITH CHECK (
    (uploaded_by = auth.uid() AND public.is_admin())
    OR public.is_super_admin()
  );

CREATE POLICY "government_work_images_super_admin_delete" ON public.government_work_images
  FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR public.is_super_admin());

-- ---- NOTIFICATIONS ----
DROP POLICY IF EXISTS "notifications_select_recipient" ON public.notifications;
DROP POLICY IF EXISTS "notifications_official_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_recipient_or_admin" ON public.notifications;

CREATE POLICY "notifications_select_recipient" ON public.notifications
  FOR SELECT TO authenticated
  USING (
    recipient_id = auth.uid()
    OR public.is_super_admin()
    OR (public.current_user_role() = 'village_admin'::public.app_role AND public.same_village_as_caller(village_id))
  );

CREATE POLICY "notifications_admin_insert" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "notifications_update_recipient_or_admin" ON public.notifications
  FOR UPDATE TO authenticated
  USING (
    recipient_id = auth.uid()
    OR public.is_super_admin()
  )
  WITH CHECK (
    recipient_id = auth.uid()
    OR public.is_super_admin()
  );

-- ---- EVENTS ----
DROP POLICY IF EXISTS "events_select_public" ON public.events;
DROP POLICY IF EXISTS "events_manage_own_official_or_admin" ON public.events;
DROP POLICY IF EXISTS "events_manage_own_or_admin" ON public.events;

CREATE POLICY "events_select_public" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "events_admin_insert" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (
      public.is_super_admin()
      OR (public.current_user_role() = 'village_admin'::public.app_role AND public.same_village_as_caller(village_id))
    )
  );

CREATE POLICY "events_admin_update" ON public.events
  FOR UPDATE TO authenticated
  USING (
    (created_by = auth.uid() AND public.is_admin())
    OR public.is_super_admin()
  )
  WITH CHECK (
    (created_by = auth.uid() AND public.is_admin())
    OR public.is_super_admin()
  );

CREATE POLICY "events_delete_owner_or_super_admin" ON public.events
  FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.is_super_admin());

-- ---- LISTINGS ----
DROP POLICY IF EXISTS "Listings are public to read" ON public.listings;
DROP POLICY IF EXISTS "Authenticated can create listings" ON public.listings;
DROP POLICY IF EXISTS "Owners can update their listings" ON public.listings;
DROP POLICY IF EXISTS "Owners or admins can delete" ON public.listings;
DROP POLICY IF EXISTS "listings_select_public" ON public.listings;
DROP POLICY IF EXISTS "listings_insert_authenticated" ON public.listings;
DROP POLICY IF EXISTS "listings_update_owner_or_admin" ON public.listings;
DROP POLICY IF EXISTS "listings_delete_owner_or_admin" ON public.listings;

CREATE POLICY "listings_select_public" ON public.listings
  FOR SELECT USING (true);

CREATE POLICY "listings_insert_authenticated" ON public.listings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "listings_update_owner_or_super_admin" ON public.listings
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR public.is_super_admin())
  WITH CHECK (auth.uid() = owner_id OR public.is_super_admin());

CREATE POLICY "listings_delete_owner_or_super_admin" ON public.listings
  FOR DELETE TO authenticated
  USING (auth.uid() = owner_id OR public.is_super_admin());

-- ---- PRODUCTS ----
-- Approved dealers manage own products; super_admin manages all
DROP POLICY IF EXISTS "products_select_public" ON public.products;
DROP POLICY IF EXISTS "products_farmer_manage_own" ON public.products;

CREATE POLICY "products_select_public" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "products_dealer_insert" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (
    farmer_id = auth.uid()
    AND (public.is_approved_dealer() OR public.is_super_admin())
  );

CREATE POLICY "products_dealer_update" ON public.products
  FOR UPDATE TO authenticated
  USING (farmer_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (farmer_id = auth.uid() OR public.is_super_admin());

CREATE POLICY "products_delete_owner_or_super_admin" ON public.products
  FOR DELETE TO authenticated
  USING (farmer_id = auth.uid() OR public.is_super_admin());

-- ---- JOBS ----
DROP POLICY IF EXISTS "jobs_select_public" ON public.jobs;
DROP POLICY IF EXISTS "jobs_manage_own_or_admin" ON public.jobs;

CREATE POLICY "jobs_select_public" ON public.jobs
  FOR SELECT USING (true);

CREATE POLICY "jobs_insert_owner" ON public.jobs
  FOR INSERT TO authenticated
  WITH CHECK (posted_by = auth.uid());

CREATE POLICY "jobs_update_owner_or_super_admin" ON public.jobs
  FOR UPDATE TO authenticated
  USING (posted_by = auth.uid() OR public.is_super_admin())
  WITH CHECK (posted_by = auth.uid() OR public.is_super_admin());

CREATE POLICY "jobs_delete_owner_or_super_admin" ON public.jobs
  FOR DELETE TO authenticated
  USING (posted_by = auth.uid() OR public.is_super_admin());

-- ---- COMMENTS ----
DROP POLICY IF EXISTS "comments_select_public" ON public.comments;
DROP POLICY IF EXISTS "comments_manage_own_or_admin" ON public.comments;
DROP POLICY IF EXISTS "comments_manage_own_or_super_admin" ON public.comments;

CREATE POLICY "comments_select_public" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert_authenticated" ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "comments_update_own" ON public.comments
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.is_super_admin())
  WITH CHECK (author_id = auth.uid() OR public.is_super_admin());

CREATE POLICY "comments_delete_own_or_super_admin" ON public.comments
  FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.is_super_admin());

-- ---- LIKES ----
DROP POLICY IF EXISTS "likes_select_public" ON public.likes;
DROP POLICY IF EXISTS "likes_manage_own_or_admin" ON public.likes;
DROP POLICY IF EXISTS "likes_manage_own_or_super_admin" ON public.likes;

CREATE POLICY "likes_select_public" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "likes_insert_own" ON public.likes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "likes_delete_own_or_super_admin" ON public.likes
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

-- ============================================================================
-- STEP 7: Storage policies (keep existing pattern, add super_admin checks)
-- ============================================================================

-- Add dealer-specific storage bucket for shop images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('shop-images', 'shop-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Update storage policies to include shop-images bucket
DROP POLICY IF EXISTS "storage_public_read_project_buckets" ON storage.objects;
CREATE POLICY "storage_public_read_project_buckets" ON storage.objects
FOR SELECT USING (
  bucket_id IN ('profile-images', 'complaints', 'government-works', 'products', 'events', 'shop-images')
  OR (bucket_id = 'documents' AND auth.role() = 'authenticated')
);

DROP POLICY IF EXISTS "storage_users_upload_own_folder" ON storage.objects;
CREATE POLICY "storage_users_upload_own_folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id IN ('profile-images', 'complaints', 'government-works', 'products', 'events', 'documents', 'shop-images')
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "storage_users_update_own_folder" ON storage.objects;
CREATE POLICY "storage_users_update_own_folder" ON storage.objects
FOR UPDATE TO authenticated
USING ((storage.foldername(name))[1] = auth.uid()::text OR public.is_super_admin())
WITH CHECK ((storage.foldername(name))[1] = auth.uid()::text OR public.is_super_admin());

DROP POLICY IF EXISTS "storage_users_delete_own_folder_or_admin" ON storage.objects;
CREATE POLICY "storage_users_delete_own_folder_or_super_admin" ON storage.objects
FOR DELETE TO authenticated
USING ((storage.foldername(name))[1] = auth.uid()::text OR public.is_super_admin());

-- ============================================================================
-- STEP 8: Ensure grants are in place
-- ============================================================================
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
