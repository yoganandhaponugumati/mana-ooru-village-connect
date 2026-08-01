-- Migration: 20260801270000_fix_notifications_rls.sql
-- Description: Ensures notifications table is fully accessible and writable for live push & in-app alerts

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  village_id UUID REFERENCES public.villages(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  read_at TIMESTAMPTZ,
  entity_type TEXT,
  entity_id UUID,
  action_url TEXT,
  dedupe_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grant privileges & disable RLS to avoid notification drop
GRANT ALL ON public.notifications TO authenticated, anon, service_role;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
