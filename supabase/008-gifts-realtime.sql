-- 2026-11-07 (v6.6): live notification when a friend sends a gift.
-- Run once in the Supabase SQL Editor. Safe to run again.
-- Adds booster_gifts to Supabase Realtime; row-level security still applies,
-- so each app only hears about gifts addressed to its own user.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'booster_gifts'
  ) then
    alter publication supabase_realtime add table public.booster_gifts;
  end if;
end $$;
