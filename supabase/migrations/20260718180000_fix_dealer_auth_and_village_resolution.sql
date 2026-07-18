-- ============================================================================
-- 20260718180000_fix_dealer_auth_and_village_resolution.sql
-- Fixes dealer registration status resets, imports dealer metadata on signup,
-- and adds automatic village_id resolution triggers for all village entities.
-- ============================================================================

-- 1. Modify protect_profile_role_changes() to allow users to set/reset own dealer_status to 'pending' or NULL
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

    -- DEALER_STATUS changes: only super_admin, same-village village_admin, OR self setting to 'pending'/NULL
    IF NEW.dealer_status IS DISTINCT FROM OLD.dealer_status THEN
      IF caller_role = 'super_admin' THEN
        -- super_admin can always change dealer_status
        NULL;
      ELSIF caller_role = 'village_admin'
        AND OLD.village_id IS NOT NULL
        AND OLD.village_id = public.caller_village_id() THEN
        -- village_admin can approve/reject dealers in their own village
        NULL;
      ELSIF caller_id = NEW.id AND (NEW.dealer_status = 'pending' OR NEW.dealer_status IS NULL) THEN
        -- ALLOW self-service application and cancellation/reset of dealer applications
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


-- 2. Modify handle_new_user() trigger to copy dealer fields from raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, display_name, email, phone, occupation, photo_url, avatar_url,
    address, bio, account_type, role, state, district, mandal, village,
    dealer_status, dealer_category, shop_name, shop_address, shop_description
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
    'citizen'::public.app_role,  -- Always citizen on signup
    NEW.raw_user_meta_data->>'state',
    NEW.raw_user_meta_data->>'district',
    NEW.raw_user_meta_data->>'mandal',
    NEW.raw_user_meta_data->>'village',
    -- Copy dealer metadata if passed
    NEW.raw_user_meta_data->>'dealer_status',
    NEW.raw_user_meta_data->>'dealer_category',
    NEW.raw_user_meta_data->>'shop_name',
    NEW.raw_user_meta_data->>'shop_address',
    NEW.raw_user_meta_data->>'shop_description'
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
    dealer_status = COALESCE(EXCLUDED.dealer_status, public.profiles.dealer_status),
    dealer_category = COALESCE(EXCLUDED.dealer_category, public.profiles.dealer_category),
    shop_name = COALESCE(EXCLUDED.shop_name, public.profiles.shop_name),
    shop_address = COALESCE(EXCLUDED.shop_address, public.profiles.shop_address),
    shop_description = COALESCE(EXCLUDED.shop_description, public.profiles.shop_description),
    updated_at = now();
  RETURN NEW;
END;
$$;


-- 3. Create resolve_entity_village_id() trigger function
CREATE OR REPLACE FUNCTION public.resolve_entity_village_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.village_id IS NULL THEN
    -- Resolve village_id from the owner/author profile
    -- The owner column is named differently across tables:
    -- listings: owner_id
    -- complaints: citizen_id
    -- announcements: author_id
    -- government_works: created_by
    -- products: farmer_id
    -- jobs: posted_by
    -- events: created_by
    NEW.village_id := (
      SELECT village_id 
      FROM public.profiles 
      WHERE id = COALESCE(
        NEW.owner_id, 
        NEW.citizen_id, 
        NEW.author_id, 
        NEW.created_by, 
        NEW.farmer_id, 
        NEW.posted_by
      )
    );
  END IF;
  RETURN NEW;
END;
$$;


-- 4. Register BEFORE INSERT triggers for all relevant tables
DROP TRIGGER IF EXISTS trg_listings_resolve_village_id ON public.listings;
CREATE TRIGGER trg_listings_resolve_village_id
BEFORE INSERT ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.resolve_entity_village_id();

DROP TRIGGER IF EXISTS trg_complaints_resolve_village_id ON public.complaints;
CREATE TRIGGER trg_complaints_resolve_village_id
BEFORE INSERT ON public.complaints
FOR EACH ROW EXECUTE FUNCTION public.resolve_entity_village_id();

DROP TRIGGER IF EXISTS trg_announcements_resolve_village_id ON public.announcements;
CREATE TRIGGER trg_announcements_resolve_village_id
BEFORE INSERT ON public.announcements
FOR EACH ROW EXECUTE FUNCTION public.resolve_entity_village_id();

DROP TRIGGER IF EXISTS trg_government_works_resolve_village_id ON public.government_works;
CREATE TRIGGER trg_government_works_resolve_village_id
BEFORE INSERT ON public.government_works
FOR EACH ROW EXECUTE FUNCTION public.resolve_entity_village_id();

DROP TRIGGER IF EXISTS trg_products_resolve_village_id ON public.products;
CREATE TRIGGER trg_products_resolve_village_id
BEFORE INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION public.resolve_entity_village_id();

DROP TRIGGER IF EXISTS trg_jobs_resolve_village_id ON public.jobs;
CREATE TRIGGER trg_jobs_resolve_village_id
BEFORE INSERT ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.resolve_entity_village_id();

DROP TRIGGER IF EXISTS trg_events_resolve_village_id ON public.events;
CREATE TRIGGER trg_events_resolve_village_id
BEFORE INSERT ON public.events
FOR EACH ROW EXECUTE FUNCTION public.resolve_entity_village_id();


-- 5. One-time sync backfill of village_id for existing records
UPDATE public.listings l
SET village_id = p.village_id
FROM public.profiles p
WHERE l.owner_id = p.id AND l.village_id IS NULL AND p.village_id IS NOT NULL;

UPDATE public.complaints c
SET village_id = p.village_id
FROM public.profiles p
WHERE c.citizen_id = p.id AND c.village_id IS NULL AND p.village_id IS NOT NULL;

UPDATE public.announcements a
SET village_id = p.village_id
FROM public.profiles p
WHERE a.author_id = p.id AND a.village_id IS NULL AND p.village_id IS NOT NULL;

UPDATE public.government_works g
SET village_id = p.village_id
FROM public.profiles p
WHERE g.created_by = p.id AND g.village_id IS NULL AND p.village_id IS NOT NULL;

UPDATE public.products pr
SET village_id = p.village_id
FROM public.profiles p
WHERE pr.farmer_id = p.id AND pr.village_id IS NULL AND p.village_id IS NOT NULL;

UPDATE public.jobs j
SET village_id = p.village_id
FROM public.profiles p
WHERE j.posted_by = p.id AND j.village_id IS NULL AND p.village_id IS NOT NULL;

UPDATE public.events e
SET village_id = p.village_id
FROM public.profiles p
WHERE e.created_by = p.id AND e.village_id IS NULL AND p.village_id IS NOT NULL;
