-- Catch-up for 002 + 003 + 004 in one go (2026-11-06). Safe to run more
-- than once - everything is "if exists / if not exists / or replace".

-- 002: usernames 8-20 characters
alter table public.profiles drop constraint if exists username_format;
alter table public.profiles add constraint username_format check (username ~ '^[A-Za-z0-9_]{8,20}$') not valid;

-- 003: at most 5 linked summoners per profile
create or replace function public.limit_riot_accounts() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.riot_accounts where user_id = new.user_id) >= 5 then
    raise exception 'You can link at most 5 summoners';
  end if;
  return new;
end $$;
drop trigger if exists riot_accounts_limit on public.riot_accounts;
create trigger riot_accounts_limit
  before insert on public.riot_accounts
  for each row execute function public.limit_riot_accounts();

-- 004: online copy of the running challenge per summoner
create table if not exists public.challenge_runs (
  puuid text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists challenge_runs_user on public.challenge_runs (user_id);
alter table public.challenge_runs enable row level security;
drop policy if exists "runs: read own" on public.challenge_runs;
drop policy if exists "runs: insert own" on public.challenge_runs;
drop policy if exists "runs: update own" on public.challenge_runs;
drop policy if exists "runs: delete own" on public.challenge_runs;
create policy "runs: read own" on public.challenge_runs
  for select to authenticated using (user_id = auth.uid());
create policy "runs: insert own" on public.challenge_runs
  for insert to authenticated with check (user_id = auth.uid());
create policy "runs: update own" on public.challenge_runs
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "runs: delete own" on public.challenge_runs
  for delete to authenticated using (user_id = auth.uid());
