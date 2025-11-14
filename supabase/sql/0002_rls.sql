-- Row Level Security policies

alter table public.users enable row level security;
alter table public.campaigns enable row level security;
alter table public.recipients enable row level security;
alter table public.events enable row level security;
alter table public.risk_scores enable row level security;
alter table public.email_logs enable row level security;
alter table public.link_scans enable row level security;
alter table public.lessons enable row level security;

-- Users table: users can read/update themselves. Admins can access all.
-- Split into separate policies to avoid infinite recursion
create policy if not exists "Users can view self" on public.users
  for select using (auth.uid() = id);

-- Admins can view all users (using helper function to avoid recursion)
create policy if not exists "Admins can view all users" on public.users
  for select using (public.is_admin());

create policy if not exists "Users can insert self" on public.users
  for insert with check (auth.uid() = id);

create policy if not exists "Users can update self" on public.users
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Campaigns: admins full access, owners read/write.
create policy if not exists "Admins can manage campaigns" on public.campaigns
  using (public.is_admin())
  with check (public.is_admin());

create policy if not exists "Owners can view campaigns" on public.campaigns
  for select using (created_by = auth.uid());

-- Recipients: campaign admins only.
create policy if not exists "Admins can manage recipients" on public.recipients
  using (public.is_admin())
  with check (public.is_admin());

-- Events: users see their events, admins see all; inserts allowed to everyone for tracking.
create policy if not exists "Users can insert events" on public.events
  for insert with check (true);

create policy if not exists "Users can view own events" on public.events
  for select using (user_id = auth.uid() or recipient_id is not null);

create policy if not exists "Admins can view events" on public.events
  for select using (public.is_admin());

create policy if not exists "Admins can manage events" on public.events
  for update using (public.is_admin())
  with check (public.is_admin());

-- Risk scores: users view own, admins full.
create policy if not exists "Users can view risk" on public.risk_scores
  for select using (user_id = auth.uid());

create policy if not exists "Admins manage risk" on public.risk_scores
  using (public.is_admin())
  with check (public.is_admin());

-- Email logs, link scans: admins only.
create policy if not exists "Admins manage email logs" on public.email_logs
  using (public.is_admin())
  with check (public.is_admin());

create policy if not exists "Admins manage link scans" on public.link_scans
  using (public.is_admin())
  with check (public.is_admin());

create policy if not exists "Lessons readable by all" on public.lessons
  for select using (true);

create policy if not exists "Admins manage lessons" on public.lessons
  using (public.is_admin())
  with check (public.is_admin());
