-- ============================================================================
-- 20260719130000_fix_complaint_status_and_dealer_rls.sql
-- Fixes dealer approval RLS policies so village admins can view & approve applications,
-- and ensures complaints table supports 3-state statuses (pending, in_progress, completed).
-- ============================================================================

-- 1. Ensure profiles_update_self_or_admin allows village_admin to update dealer applications
DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON public.profiles;

CREATE POLICY "profiles_update_self_or_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = id 
    OR public.is_super_admin()
    OR (
      public.current_user_role() = 'village_admin'::public.app_role
      AND (public.same_village_as_caller(village_id) OR village_id IS NULL)
    )
  )
  WITH CHECK (
    auth.uid() = id 
    OR public.is_super_admin()
    OR (
      public.current_user_role() = 'village_admin'::public.app_role
      AND (public.same_village_as_caller(village_id) OR village_id IS NULL)
    )
  );

-- 2. Modify protect_profile_role_changes() trigger to allow village admins to promote dealers
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
    -- ROLE changes: super_admin can change any role, OR village_admin promoting an approved dealer
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      IF caller_role = 'super_admin' THEN
        NULL;
      ELSIF caller_role = 'village_admin' 
        AND NEW.role = 'dealer'::public.app_role 
        AND NEW.dealer_status = 'approved' THEN
        NULL;
      ELSE
        NEW.role := OLD.role;
      END IF;
    END IF;

    -- ACCOUNT_TYPE changes: only super_admin or dealer promotion
    IF NEW.account_type IS DISTINCT FROM OLD.account_type THEN
      IF caller_role != 'super_admin' AND NOT (caller_role = 'village_admin' AND NEW.role = 'dealer'::public.app_role) THEN
        NEW.account_type := OLD.account_type;
      END IF;
    END IF;

    -- DEALER_STATUS changes: super_admin, same-village village_admin, or unassigned village_admin
    IF NEW.dealer_status IS DISTINCT FROM OLD.dealer_status THEN
      IF caller_role = 'super_admin' THEN
        NULL;
      ELSIF caller_role = 'village_admin'
        AND (OLD.village_id IS NULL OR OLD.village_id = public.caller_village_id()) THEN
        NULL;
      ELSIF caller_id = NEW.id AND (NEW.dealer_status = 'pending' OR NEW.dealer_status IS NULL) THEN
        NULL;
      ELSE
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

    IF NEW.dealer_status IS DISTINCT FROM 'approved' AND OLD.dealer_status = 'approved' THEN
      NEW.approved_by := NULL;
      NEW.approved_at := NULL;
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Ensure complaints table has status column with default 'pending'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'complaints') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'complaints' AND column_name = 'status') THEN
      ALTER TABLE public.complaints ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
  END IF;
END $$;
