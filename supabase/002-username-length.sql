-- 2026-11-06: usernames need 8-20 characters (was 3-16).
-- Run once in the Supabase SQL Editor (schema.sql already contains the new rule).
alter table public.profiles drop constraint username_format;
alter table public.profiles add constraint username_format check (username ~ '^[A-Za-z0-9_]{8,20}$') not valid;
