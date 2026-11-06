-- 2026-11-06 (v6.1): friends + public profile snapshots.
-- Run once in the Supabase SQL Editor. Safe to run again.

-- ---------- Friendships ----------
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester uuid not null references auth.users(id) on delete cascade,
  addressee uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  constraint friendships_not_self check (requester <> addressee)
);
-- one friendship per pair, no matter who asked
create unique index if not exists friendships_pair on public.friendships (least(requester, addressee), greatest(requester, addressee));

alter table public.friendships enable row level security;
drop policy if exists "friends: read own" on public.friendships;
drop policy if exists "friends: send request" on public.friendships;
drop policy if exists "friends: accept" on public.friendships;
drop policy if exists "friends: remove" on public.friendships;
create policy "friends: read own" on public.friendships
  for select to authenticated using (auth.uid() in (requester, addressee));
create policy "friends: send request" on public.friendships
  for insert to authenticated with check (requester = auth.uid() and status = 'pending');
create policy "friends: accept" on public.friendships
  for update to authenticated using (addressee = auth.uid()) with check (addressee = auth.uid() and status = 'accepted');
create policy "friends: remove" on public.friendships
  for delete to authenticated using (auth.uid() in (requester, addressee));

create or replace function public.is_friend(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.requester = a and f.addressee = b) or (f.requester = b and f.addressee = a))
  );
$$;

-- ---------- Public profile snapshot (what friends see) ----------
create table if not exists public.public_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.public_profiles enable row level security;
drop policy if exists "public profile: own or friend" on public.public_profiles;
drop policy if exists "public profile: insert own" on public.public_profiles;
drop policy if exists "public profile: update own" on public.public_profiles;
create policy "public profile: own or friend" on public.public_profiles
  for select to authenticated using (user_id = auth.uid() or public.is_friend(auth.uid(), user_id));
create policy "public profile: insert own" on public.public_profiles
  for insert to authenticated with check (user_id = auth.uid());
create policy "public profile: update own" on public.public_profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
