-- 2026-11-06 (v6.0): the running challenge per summoner, online copy.
-- data = null means "no challenge running". Run once in the Supabase SQL Editor.
create table public.challenge_runs (
  puuid text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb,
  updated_at timestamptz not null default now()
);
create index challenge_runs_user on public.challenge_runs (user_id);

alter table public.challenge_runs enable row level security;
create policy "runs: read own" on public.challenge_runs
  for select to authenticated using (user_id = auth.uid());
create policy "runs: insert own" on public.challenge_runs
  for insert to authenticated with check (user_id = auth.uid());
create policy "runs: update own" on public.challenge_runs
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "runs: delete own" on public.challenge_runs
  for delete to authenticated using (user_id = auth.uid());
