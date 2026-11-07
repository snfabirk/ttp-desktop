-- 2026-11-07 (v6.6): sticker trades between friends.
-- Run once in the Supabase SQL Editor. Safe to run again.
--
-- Flow (offer based): the proposer's app reserves the offered stickers locally
-- and inserts an 'open' row. The partner accepts or declines, the proposer can
-- cancel - each through ONE atomic function, so a trade is decided exactly once.
-- Afterwards the proposer's app settles the result once (settle_sticker_trades):
-- it receives the wanted stickers, or gets the reserved ones back.

create table if not exists public.sticker_trades (
  id uuid primary key default gen_random_uuid(),
  proposer uuid not null references auth.users(id) on delete cascade,
  partner uuid not null references auth.users(id) on delete cascade,
  give jsonb not null,  -- [{ "set": "base", "n": 12, "qty": 1 }] what the proposer gives
  want jsonb not null,  -- what the proposer wants in return
  message text check (message is null or char_length(message) <= 80),
  status text not null default 'open' check (status in ('open', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  proposer_settled boolean not null default false,
  constraint sticker_trades_not_self check (proposer <> partner),
  constraint sticker_trades_give_size check (jsonb_typeof(give) = 'array' and jsonb_array_length(give) between 1 and 10),
  constraint sticker_trades_want_size check (jsonb_typeof(want) = 'array' and jsonb_array_length(want) between 1 and 10)
);
create index if not exists sticker_trades_partner_open on public.sticker_trades (partner) where status = 'open';
create index if not exists sticker_trades_proposer_unsettled on public.sticker_trades (proposer) where not proposer_settled;

alter table public.sticker_trades enable row level security;
drop policy if exists "trades: read own" on public.sticker_trades;
drop policy if exists "trades: offer to friend" on public.sticker_trades;
create policy "trades: read own" on public.sticker_trades
  for select to authenticated using (auth.uid() in (proposer, partner));
create policy "trades: offer to friend" on public.sticker_trades
  for insert to authenticated
  with check (proposer = auth.uid() and status = 'open' and not proposer_settled and decided_at is null
              and public.is_friend(proposer, partner));

-- Partner accepts / declines, proposer cancels: only while still open
create or replace function public.decide_sticker_trade(trade_id uuid, decision text)
returns setof public.sticker_trades
language sql volatile security definer set search_path = public as $$
  update public.sticker_trades
     set status = decision, decided_at = now()
   where id = trade_id and status = 'open'
     and (   (decision in ('accepted', 'declined') and partner = auth.uid())
          or (decision = 'cancelled' and proposer = auth.uid()))
  returning *;
$$;
revoke all on function public.decide_sticker_trade(uuid, text) from public;
grant execute on function public.decide_sticker_trade(uuid, text) to authenticated;

-- Proposer collects every decided trade exactly once
create or replace function public.settle_sticker_trades()
returns setof public.sticker_trades
language sql volatile security definer set search_path = public as $$
  update public.sticker_trades
     set proposer_settled = true
   where proposer = auth.uid() and status <> 'open' and not proposer_settled
  returning *;
$$;
revoke all on function public.settle_sticker_trades() from public;
grant execute on function public.settle_sticker_trades() to authenticated;

-- Live notifications (row-level security still applies)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'sticker_trades'
  ) then
    alter publication supabase_realtime add table public.sticker_trades;
  end if;
end $$;
