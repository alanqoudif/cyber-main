-- Base schema for CyberMirror 2.0
-- Run via Supabase SQL editor or the migrate helper script.

create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key references auth.users on delete cascade,
  email text not null unique,
  name text,
  role text not null default 'USER' check (role in ('ADMIN', 'USER')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recipients (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  name text,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('OPEN', 'CLICK', 'REPORT', 'IGNORE')),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  recipient_id uuid references public.recipients(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  meta jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.risk_scores (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  score integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, campaign_id)
);

create table if not exists public.email_logs (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  recipient_id uuid references public.recipients(id) on delete set null,
  user_id uuid references public.users(id) on delete set null,
  status text not null default 'queued',
  subject text,
  error text,
  meta jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.link_scans (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.campaigns(id) on delete cascade,
  url text not null,
  scan_id text,
  status text not null default 'pending',
  risk_label text,
  details jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, url)
);

create table if not exists public.lessons (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  title text not null,
  description text,
  content jsonb not null,
  duration integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_events_campaign_id on public.events(campaign_id);
create index if not exists idx_events_user_id on public.events(user_id);
create index if not exists idx_events_created_at on public.events(created_at desc);
create index if not exists idx_risk_scores_user_campaign on public.risk_scores(user_id, campaign_id);
create index if not exists idx_link_scans_status on public.link_scans(status);
