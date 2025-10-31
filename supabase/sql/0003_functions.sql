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

