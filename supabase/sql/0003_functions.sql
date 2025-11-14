-- Helper function to check if current user is admin (avoids RLS recursion)
-- Uses SECURITY DEFINER to bypass RLS when checking public.users
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_role text;
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    return false;
  end if;
  
  -- Check public.users directly (SECURITY DEFINER bypasses RLS)
  select role into v_role
  from public.users
  where id = v_user_id;
  
  return v_role = 'ADMIN';
end;
$$;

-- Function to automatically create user profile when auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', null),
    'USER'
  )
  on conflict (id) do update
  set email = excluded.email,
      name = coalesce(excluded.name, users.name),
      updated_at = now();
  return new;
end;
$$;

-- Trigger to create user profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();

-- Helper function to recalculate risk score

create or replace function public.recalculate_risk_score(p_user_id uuid, p_campaign_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_score integer := 0;
begin
  select coalesce(sum(
    case type
      when 'CLICK' then 5
      when 'OPEN' then 1
      when 'REPORT' then -4
      else 0
    end
  ), 0)
  into v_score
  from public.events
  where user_id = p_user_id
    and (p_campaign_id is null or campaign_id = p_campaign_id);

  insert into public.risk_scores (user_id, campaign_id, score)
  values (p_user_id, p_campaign_id, v_score)
  on conflict (user_id, campaign_id)
  do update set score = excluded.score, updated_at = now();
end;
$$;

comment on function public.recalculate_risk_score is 'Recomputes risk scores based on user events. Called from triggers.';

drop trigger if exists trg_events_recalculate_risk on public.events;

create trigger trg_events_recalculate_risk
after insert or update or delete on public.events
for each row
execute function public.recalculate_risk_score(
  coalesce(new.user_id, old.user_id),
  coalesce(new.campaign_id, old.campaign_id)
);

