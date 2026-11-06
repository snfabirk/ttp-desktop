-- 2026-11-06: at most 5 linked summoners per profile (the app checks too).
-- Run once in the Supabase SQL Editor.
create function public.limit_riot_accounts() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.riot_accounts where user_id = new.user_id) >= 5 then
    raise exception 'You can link at most 5 summoners';
  end if;
  return new;
end $$;

create trigger riot_accounts_limit
  before insert on public.riot_accounts
  for each row execute function public.limit_riot_accounts();
