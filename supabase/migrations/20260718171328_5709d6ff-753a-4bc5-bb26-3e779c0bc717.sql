
-- 1) Restrict profiles SELECT to authenticated users only (removes public phone exposure)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- 2) Restrict listings SELECT to authenticated users only (removes public contact exposure)
DROP POLICY IF EXISTS "Listings are public to read" ON public.listings;
CREATE POLICY "Authenticated users can view listings"
  ON public.listings
  FOR SELECT
  TO authenticated
  USING (true);

-- 3) Convert has_role to SECURITY INVOKER so it no longer bypasses RLS.
-- The user_roles RLS policy already lets a user read their own roles,
-- which is all has_role(auth.uid(), ...) needs.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$function$;
