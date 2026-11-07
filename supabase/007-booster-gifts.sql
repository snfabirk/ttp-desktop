-- 2026-11-07 (v6.6): gift boosters to friends.
-- Run once in the Supabase SQL Editor. Safe to run again.
--
-- The sender's app removes the boosters locally and inserts one row here; the
-- recipient's app claims all open rows in ONE atomic update (claim_booster_gifts),
-- so a gift can never arrive twice.

create table if not exists public.booster_gifts (
  id uuid primary key default gen_random_uuid(),
  sender uuid not null references auth.users(id) on delete cascade,
  recipient uuid not null references auth.users(id) on delete cascade,
  set_id text not null check (set_id ~ '^[a-z0-9_-]{1,24}$'),
  qty int not null check (qty between 1 and 10),
  message text check (message is null or char_length(message) <= 80),
  created_at timestamptz not null default now(),
  claimed_at timestamptz,
  constraint booster_gifts_not_self check (sender <> recipient)
);
create index if not exists booster_gifts_open on public.booster_gifts (recipient) where claimed_at is null;

alter table public.booster_gifts enable row level security;
drop policy if exists "gifts: read own" on public.booster_gifts;
drop policy if exists "gifts: send to friend" on public.booster_gifts;
-- sender and recipient can see a gift; nobody can edit or delete it directly
create policy "gifts: read own" on public.booster_gifts
  for select to authenticated using (auth.uid() in (sender, recipient));
-- only to accepted friends, only as yourself, never pre-claimed
create policy "gifts: send to friend" on public.booster_gifts
  for insert to authenticated
  with check (sender = auth.uid() and claimed_at is null and public.is_friend(sender, recipient));

-- Claim every open gift for the signed-in user (atomic: each row exactly once)
create or replace function public.claim_booster_gifts()
returns setof public.booster_gifts
language sql volatile security definer set search_path = public as $$
  update public.booster_gifts
     set claimed_at = now()
   where recipient = auth.uid() and claimed_at is null
  returning *;
$$;
revoke all on function public.claim_booster_gifts() from public;
grant execute on function public.claim_booster_gifts() to authenticated;
