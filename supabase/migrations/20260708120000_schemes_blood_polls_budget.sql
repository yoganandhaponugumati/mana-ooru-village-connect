-- ManaOoru: Government Schemes, Blood Donors, Gram Sabha Polls, Village Budget
-- Follows the same role model (super_admin / village_admin / citizen) and RLS
-- conventions established in 20260630070000_sprint1_role_profile_foundation.sql

-- ============================================================
-- 1. GOVERNMENT SCHEMES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.government_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  department TEXT,
  eligibility TEXT,
  benefit_amount NUMERIC(14, 2),
  application_url TEXT,
  document_url TEXT,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('agriculture', 'health', 'education', 'housing', 'women', 'senior_citizen', 'general')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'upcoming')),
  deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scheme_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme_id UUID NOT NULL REFERENCES public.government_schemes(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
  notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (scheme_id, applicant_id)
);

-- ============================================================
-- 2. BLOOD DONORS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.blood_donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
  blood_group TEXT NOT NULL CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  phone TEXT NOT NULL,
  last_donated_on DATE,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (profile_id)
);

-- ============================================================
-- 3. GRAM SABHA / VILLAGE POLLS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.village_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL, -- e.g. [{"id":"a","label":"Yes"},{"id":"b","label":"No"}]
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.village_polls(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  option_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (poll_id, voter_id) -- one vote per person per poll
);

-- ============================================================
-- 4. VILLAGE BUDGET / DEVELOPMENT TRACKER
-- (extends existing government_works with financial line items)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.village_budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id UUID NOT NULL REFERENCES public.villages(id) ON DELETE CASCADE,
  government_work_id UUID REFERENCES public.government_works(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fiscal_year TEXT NOT NULL, -- e.g. '2026-27'
  category TEXT NOT NULL, -- roads, water, sanitation, education, health, other
  allocated_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  spent_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_schemes_village_status ON public.government_schemes (village_id, status, category);
CREATE INDEX IF NOT EXISTS idx_scheme_applications_applicant ON public.scheme_applications (applicant_id, status);
CREATE INDEX IF NOT EXISTS idx_scheme_applications_scheme ON public.scheme_applications (scheme_id, status);
CREATE INDEX IF NOT EXISTS idx_blood_donors_village_group ON public.blood_donors (village_id, blood_group, available);
CREATE INDEX IF NOT EXISTS idx_polls_village_status ON public.village_polls (village_id, status, ends_at);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON public.poll_votes (poll_id, option_id);
CREATE INDEX IF NOT EXISTS idx_budget_village_year ON public.village_budget_items (village_id, fiscal_year);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheme_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_budget_items ENABLE ROW LEVEL SECURITY;

-- Schemes: public read, admin-only write
DROP POLICY IF EXISTS "schemes_select_public" ON public.government_schemes;
DROP POLICY IF EXISTS "schemes_admin_write" ON public.government_schemes;
CREATE POLICY "schemes_select_public" ON public.government_schemes FOR SELECT USING (true);
CREATE POLICY "schemes_admin_write" ON public.government_schemes
FOR ALL TO authenticated
USING (created_by = auth.uid() AND public.current_user_role() IN ('super_admin', 'village_admin'))
WITH CHECK (created_by = auth.uid() AND public.current_user_role() IN ('super_admin', 'village_admin'));

-- Scheme applications: applicant sees own, admin sees all in scope
DROP POLICY IF EXISTS "scheme_apps_select_own_or_admin" ON public.scheme_applications;
DROP POLICY IF EXISTS "scheme_apps_insert_own" ON public.scheme_applications;
DROP POLICY IF EXISTS "scheme_apps_update_own_or_admin" ON public.scheme_applications;
CREATE POLICY "scheme_apps_select_own_or_admin" ON public.scheme_applications
FOR SELECT TO authenticated
USING (applicant_id = auth.uid() OR public.current_user_role() IN ('super_admin', 'village_admin'));
CREATE POLICY "scheme_apps_insert_own" ON public.scheme_applications
FOR INSERT TO authenticated WITH CHECK (applicant_id = auth.uid());
CREATE POLICY "scheme_apps_update_own_or_admin" ON public.scheme_applications
FOR UPDATE TO authenticated
USING (applicant_id = auth.uid() OR public.current_user_role() IN ('super_admin', 'village_admin'))
WITH CHECK (applicant_id = auth.uid() OR public.current_user_role() IN ('super_admin', 'village_admin'));

-- Blood donors: public read (life-saving info should be discoverable), self or admin write
DROP POLICY IF EXISTS "blood_donors_select_public" ON public.blood_donors;
DROP POLICY IF EXISTS "blood_donors_write_self_or_admin" ON public.blood_donors;
CREATE POLICY "blood_donors_select_public" ON public.blood_donors FOR SELECT USING (true);
CREATE POLICY "blood_donors_write_self_or_admin" ON public.blood_donors
FOR ALL TO authenticated
USING (profile_id = auth.uid() OR public.current_user_role() IN ('super_admin', 'village_admin'))
WITH CHECK (profile_id = auth.uid() OR public.current_user_role() IN ('super_admin', 'village_admin'));

-- Village polls: public read, admin-only create/manage
DROP POLICY IF EXISTS "polls_select_public" ON public.village_polls;
DROP POLICY IF EXISTS "polls_admin_write" ON public.village_polls;
CREATE POLICY "polls_select_public" ON public.village_polls FOR SELECT USING (true);
CREATE POLICY "polls_admin_write" ON public.village_polls
FOR ALL TO authenticated
USING (created_by = auth.uid() AND public.current_user_role() IN ('super_admin', 'village_admin'))
WITH CHECK (created_by = auth.uid() AND public.current_user_role() IN ('super_admin', 'village_admin'));

-- Poll votes: any authenticated citizen can vote once; results readable by all
DROP POLICY IF EXISTS "poll_votes_select_public" ON public.poll_votes;
DROP POLICY IF EXISTS "poll_votes_insert_own" ON public.poll_votes;
CREATE POLICY "poll_votes_select_public" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "poll_votes_insert_own" ON public.poll_votes
FOR INSERT TO authenticated WITH CHECK (voter_id = auth.uid());

-- Village budget: public read (transparency by design), admin-only write
DROP POLICY IF EXISTS "budget_select_public" ON public.village_budget_items;
DROP POLICY IF EXISTS "budget_admin_write" ON public.village_budget_items;
CREATE POLICY "budget_select_public" ON public.village_budget_items FOR SELECT USING (true);
CREATE POLICY "budget_admin_write" ON public.village_budget_items
FOR ALL TO authenticated
USING (created_by = auth.uid() AND public.current_user_role() IN ('super_admin', 'village_admin'))
WITH CHECK (created_by = auth.uid() AND public.current_user_role() IN ('super_admin', 'village_admin'));

GRANT SELECT ON public.government_schemes, public.scheme_applications, public.blood_donors,
  public.village_polls, public.poll_votes, public.village_budget_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.government_schemes, public.scheme_applications,
  public.blood_donors, public.village_polls, public.poll_votes, public.village_budget_items TO authenticated;
