-- Migration: 20260815180000_enforce_strict_rls_all_tables.sql
-- Description: Re-enables RLS on disabled tables and enforces strict Village Isolation on all main tables.

-- 1. Helper function for Village Isolation
CREATE OR REPLACE FUNCTION public.current_user_village_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT village_id FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Re-enable RLS on all tables that had it disabled
ALTER TABLE public.village_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Profiles: Only viewable by users in the same village or admins
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_isolated" ON public.profiles
FOR SELECT USING (
  public.is_admin() OR 
  village_id = public.current_user_village_id() OR 
  id = auth.uid()
);

-- 4. Listings: Only viewable by users in the same village or admins
DROP POLICY IF EXISTS "listings_select_public" ON public.listings;
CREATE POLICY "listings_select_isolated" ON public.listings
FOR SELECT USING (
  public.is_admin() OR 
  village_id = public.current_user_village_id() OR
  owner_id = auth.uid()
);

-- 5. Complaints: Only viewable by the citizen, assigned official, or village admin/super admin
DROP POLICY IF EXISTS "complaints_select_related" ON public.complaints;
CREATE POLICY "complaints_select_isolated" ON public.complaints
FOR SELECT TO authenticated
USING (
  citizen_id = auth.uid() OR
  assigned_admin_id = auth.uid() OR
  (public.current_user_role() IN ('official', 'admin') AND village_id = public.current_user_village_id()) OR
  public.is_admin()
);

-- 6. Announcements: Only viewable by users in the same village
DROP POLICY IF EXISTS "announcements_select_public" ON public.announcements;
CREATE POLICY "announcements_select_isolated" ON public.announcements
FOR SELECT USING (
  public.is_admin() OR 
  village_id = public.current_user_village_id() OR
  author_id = auth.uid()
);

-- 7. Notifications: Strict recipient or admin logic
DROP POLICY IF EXISTS "notifications_select_recipient" ON public.notifications;
CREATE POLICY "notifications_select_isolated" ON public.notifications
FOR SELECT TO authenticated
USING (
  recipient_id = auth.uid() OR 
  public.is_admin()
);

-- 8. Village Stories: Village Isolated
DROP POLICY IF EXISTS "village_stories_select_public" ON public.village_stories;
CREATE POLICY "village_stories_select_isolated" ON public.village_stories
FOR SELECT USING (
  public.is_admin() OR 
  village_id = public.current_user_village_id() OR
  author_id = auth.uid()
);

-- 9. Emergency Contacts: Village Isolated
DROP POLICY IF EXISTS "emergency_contacts_select_public" ON public.emergency_contacts;
CREATE POLICY "emergency_contacts_select_isolated" ON public.emergency_contacts
FOR SELECT USING (
  public.is_admin() OR 
  village_id = public.current_user_village_id()
);

-- 10. Audit Logs: Only Super Admin and Village Admin
DROP POLICY IF EXISTS "audit_logs_select_admin" ON public.audit_logs;
CREATE POLICY "audit_logs_select_isolated" ON public.audit_logs
FOR SELECT USING (
  public.is_admin() OR 
  (public.current_user_role() = 'official' AND village_id = public.current_user_village_id())
);
