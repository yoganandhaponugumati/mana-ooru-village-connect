
-- government_works
CREATE TABLE IF NOT EXISTS public.government_works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  village_id uuid REFERENCES public.villages(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  department text,
  budget numeric,
  status text NOT NULL DEFAULT 'planned',
  start_date date,
  end_date date,
  location text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.government_works TO authenticated;
GRANT ALL ON public.government_works TO service_role;
ALTER TABLE public.government_works ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read works" ON public.government_works;
CREATE POLICY "Authenticated read works" ON public.government_works
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Owners insert works" ON public.government_works;
CREATE POLICY "Owners insert works" ON public.government_works
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "Owners update works" ON public.government_works;
CREATE POLICY "Owners update works" ON public.government_works
  FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "Owners delete works" ON public.government_works;
CREATE POLICY "Owners delete works" ON public.government_works
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- government_work_images
CREATE TABLE IF NOT EXISTS public.government_work_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  government_work_id uuid NOT NULL REFERENCES public.government_works(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  storage_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.government_work_images TO authenticated;
GRANT ALL ON public.government_work_images TO service_role;
ALTER TABLE public.government_work_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read work images" ON public.government_work_images;
CREATE POLICY "Authenticated read work images" ON public.government_work_images
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Uploaders insert work images" ON public.government_work_images;
CREATE POLICY "Uploaders insert work images" ON public.government_work_images
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = uploaded_by);
DROP POLICY IF EXISTS "Uploaders delete work images" ON public.government_work_images;
CREATE POLICY "Uploaders delete work images" ON public.government_work_images
  FOR DELETE TO authenticated USING (auth.uid() = uploaded_by);

-- government_schemes
CREATE TABLE IF NOT EXISTS public.government_schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  village_id uuid REFERENCES public.villages(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  department text,
  eligibility text,
  benefit_amount numeric,
  application_url text,
  document_url text,
  category text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'active',
  deadline date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.government_schemes TO authenticated;
GRANT ALL ON public.government_schemes TO service_role;
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read schemes" ON public.government_schemes;
CREATE POLICY "Authenticated read schemes" ON public.government_schemes
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Owners insert schemes" ON public.government_schemes;
CREATE POLICY "Owners insert schemes" ON public.government_schemes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "Owners update schemes" ON public.government_schemes;
CREATE POLICY "Owners update schemes" ON public.government_schemes
  FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "Owners delete schemes" ON public.government_schemes;
CREATE POLICY "Owners delete schemes" ON public.government_schemes
  FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- scheme_applications
CREATE TABLE IF NOT EXISTS public.scheme_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id uuid NOT NULL REFERENCES public.government_schemes(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'submitted',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (scheme_id, applicant_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheme_applications TO authenticated;
GRANT ALL ON public.scheme_applications TO service_role;
ALTER TABLE public.scheme_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Applicants read own applications" ON public.scheme_applications;
CREATE POLICY "Applicants read own applications" ON public.scheme_applications
  FOR SELECT TO authenticated USING (auth.uid() = applicant_id);
DROP POLICY IF EXISTS "Applicants insert own applications" ON public.scheme_applications;
CREATE POLICY "Applicants insert own applications" ON public.scheme_applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = applicant_id);
DROP POLICY IF EXISTS "Applicants update own applications" ON public.scheme_applications;
CREATE POLICY "Applicants update own applications" ON public.scheme_applications
  FOR UPDATE TO authenticated USING (auth.uid() = applicant_id) WITH CHECK (auth.uid() = applicant_id);
DROP POLICY IF EXISTS "Applicants delete own applications" ON public.scheme_applications;
CREATE POLICY "Applicants delete own applications" ON public.scheme_applications
  FOR DELETE TO authenticated USING (auth.uid() = applicant_id);

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  village_id uuid REFERENCES public.villages(id) ON DELETE SET NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  body text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read_at timestamptz,
  entity_type text,
  entity_id uuid,
  action_url text,
  dedupe_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_recipient_idx ON public.notifications (recipient_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Recipients read notifications" ON public.notifications;
CREATE POLICY "Recipients read notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (recipient_id = auth.uid() OR recipient_id IS NULL);
DROP POLICY IF EXISTS "Users create notifications they author" ON public.notifications;
CREATE POLICY "Users create notifications they author" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
DROP POLICY IF EXISTS "Recipients update own notifications" ON public.notifications;
CREATE POLICY "Recipients update own notifications" ON public.notifications
  FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());
DROP POLICY IF EXISTS "Recipients delete own notifications" ON public.notifications;
CREATE POLICY "Recipients delete own notifications" ON public.notifications
  FOR DELETE TO authenticated USING (recipient_id = auth.uid());
