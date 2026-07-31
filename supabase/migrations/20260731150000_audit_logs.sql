-- supabase/migrations/20260731150000_audit_logs.sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  village_id UUID NOT NULL,
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL, -- 'role_changed', 'complaint_closed', 'listing_removed', etc.
  resource_type TEXT NOT NULL, -- 'profile', 'complaint', 'listing', 'announcement'
  resource_id UUID,
  old_values JSONB, -- before state
  new_values JSONB, -- after state
  reason TEXT, -- why the action was taken
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CHECK (reason IS NOT NULL) -- admins must explain
);

CREATE INDEX idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- RLS: Only village admins can read their village's logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "village_admins_read_audit_logs" ON audit_logs
  FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'village_admin'
    AND village_id = (SELECT village_id FROM profiles WHERE id = auth.uid())
  );
