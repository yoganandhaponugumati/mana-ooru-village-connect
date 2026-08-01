-- Migration: 20260801230000_seed_village_defaults.sql
-- Description: Ensures default emergency contacts and welcome notices exist for major villages

-- 1. Create emergency_contacts table if not existing
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  village_name TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  description TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Grant privileges
GRANT ALL ON public.emergency_contacts TO authenticated, anon, service_role;
ALTER TABLE public.emergency_contacts DISABLE ROW LEVEL SECURITY;

-- 2. Insert default emergency contacts if table is empty or missing defaults
INSERT INTO public.emergency_contacts (village_name, title, category, phone_number, description)
VALUES
  ('ALL', 'Emergency Ambulance', 'Health', '108', '24/7 Primary Emergency Ambulance Service'),
  ('ALL', 'Police Emergency', 'Security', '100', 'Local Sub-Inspector & Police Control Room'),
  ('ALL', 'Electricity Helpline (TSSPDCL/APSPDCL)', 'Utilities', '1912', 'Power Outage & Main Transformer Fuse Repair'),
  ('ALL', 'Women Helpline', 'Security', '181', 'Women & Child Emergency Support Line'),
  ('ALL', 'Health Information Line', 'Health', '104', 'Tele-medicine & Free Health Advice Line'),
  ('Yerraboinapalli', 'Sarpanch Office Desk', 'Government', '0841-23456', 'Gram Panchayat General Enquiries & Civic Issues'),
  ('Kallur', 'Sarpanch Office Desk', 'Government', '0841-23457', 'Kallur Gram Panchayat Desk')
ON CONFLICT DO NOTHING;

-- 3. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor_id UUID,
  target_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT ALL ON public.audit_logs TO authenticated, anon, service_role;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
