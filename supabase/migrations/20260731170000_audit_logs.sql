-- Create audit logs table
create table public.audit_logs (
    id uuid default gen_random_uuid() primary key,
    action text not null,
    actor_id uuid references auth.users(id) on delete set null,
    target_id text,
    details jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies
alter table public.audit_logs enable row level security;

create policy "Super admins can view audit logs"
    on public.audit_logs for select
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'super_admin'
        )
    );

create policy "Super admins and village admins can insert audit logs"
    on public.audit_logs for insert
    with check (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('super_admin', 'village_admin')
        )
    );
