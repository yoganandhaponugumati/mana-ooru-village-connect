-- Create error logs table for client-side crash reporting
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    message TEXT NOT NULL,
    source TEXT,
    lineno INTEGER,
    colno INTEGER,
    error_stack TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_agent TEXT,
    url TEXT
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Allow anyone (even unauthenticated users, since errors can happen on login screen) to INSERT
CREATE POLICY "Anyone can insert error logs"
ON public.error_logs
FOR INSERT 
TO public, anon
WITH CHECK (true);

-- Only super_admins can read error logs
CREATE POLICY "Super admins can read error logs"
ON public.error_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
);
