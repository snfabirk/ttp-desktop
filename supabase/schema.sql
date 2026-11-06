-- Three-Trick-Pony - online accounts (schema v1, 2026-11-06)
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.

-- ---------- Tables ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  avatar text,                                   -- profile picture cosmetic id (null = placeholder)
  created_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[A-Za-z0-9_]{8,20}$')
);
create unique index profiles_username_lower on public.profiles (lower(username));

-- Whole progression state (level, coins, inventory, pass ...) as one JSON blob
create table public.progression (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Linked Riot accounts; a summoner can belong to only one profile
create table public.riot_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  puuid text not null unique,
  game_name text not null,
  tag_line text not null,
  is_active boolean not null default false,
  verified_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index riot_accounts_user on public.riot_accounts (user_id);
create unique index riot_accounts_one_active on public.riot_accounts (user_id) where is_active;

-- ---------- Row Level Security: everyone only changes their own data ----------
alter table public.profiles enable row level security;
alter table public.progression enable row level security;
alter table public.riot_accounts enable row level security;

create policy "profiles: signed-in users can read" on public.profiles
  for select to authenticated using (true);
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "progression: read own" on public.progression
  for select to authenticated using (user_id = auth.uid());
create policy "progression: insert own" on public.progression
  for insert to authenticated with check (user_id = auth.uid());
create policy "progression: update own" on public.progression
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "riot: read own" on public.riot_accounts
  for select to authenticated using (user_id = auth.uid());
create policy "riot: insert own" on public.riot_accounts
  for insert to authenticated with check (user_id = auth.uid());
create policy "riot: update own" on public.riot_accounts
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "riot: delete own" on public.riot_accounts
  for delete to authenticated using (user_id = auth.uid());

-- ---------- Sign-up: profile + empty progression are created automatically ----------
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username) values (new.id, new.raw_user_meta_data ->> 'username');
  insert into public.progression (user_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Helpers callable from the app ----------
-- Is a username still free? (case-insensitive)
create function public.username_available(name text) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from public.profiles where lower(username) = lower(name));
$$;
grant execute on function public.username_available(text) to anon, authenticated;

-- Login with username: returns the account's e-mail ONLY if the password is
-- correct, so an optional real e-mail is never revealed to others.
create function public.login_email(name text, pass text) returns text
language plpgsql stable security definer set search_path = public, extensions as $$
declare e text; h text;
begin
  select u.email, u.encrypted_password into e, h
    from auth.users u join public.profiles p on p.id = u.id
   where lower(p.username) = lower(name);
  if e is null or h is null or extensions.crypt(pass, h) <> h then
    return null;
  end if;
  return e;
end $$;
revoke all on function public.login_email(text, text) from public;
grant execute on function public.login_email(text, text) to anon, authenticated;
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
