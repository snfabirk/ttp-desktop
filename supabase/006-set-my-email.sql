-- 2026-11-06 (v6.2): add / change / remove the optional e-mail later.
-- Supabase's own e-mail change always sends a confirmation mail (needs SMTP,
-- and fails for the hidden placeholder address), so the app calls this
-- function instead. It only ever changes the CALLING user's own e-mail.
-- Run once in the Supabase SQL Editor. Safe to run again.
create or replace function public.set_my_email(new_email text) returns text
language plpgsql security definer set search_path = public, auth as $$
declare
  uid uuid := auth.uid();
  uname text;
  target text;
begin
  if uid is null then raise exception 'Not signed in'; end if;
  select username into uname from public.profiles where id = uid;
  target := lower(trim(coalesce(new_email, '')));
  if target = '' then
    -- no e-mail: back to the hidden placeholder address
    target := lower(uname) || '@users.three-trick-pony.app';
  elsif target !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'That e-mail address does not look right.';
  elsif target like '%@users.three-trick-pony.app' then
    raise exception 'That e-mail address does not look right.';
  end if;
  if exists (select 1 from auth.users where lower(email) = target and id <> uid) then
    raise exception 'This e-mail address is already used by another account.';
  end if;
  update auth.users
     set email = target, email_change = '', email_change_token_new = '', email_change_token_current = '',
         email_confirmed_at = coalesce(email_confirmed_at, now()), updated_at = now()
   where id = uid;
  update auth.identities
     set identity_data = jsonb_set(coalesce(identity_data, '{}'::jsonb), '{email}', to_jsonb(target)), updated_at = now()
   where user_id = uid and provider = 'email';
  return target;
end $$;
revoke all on function public.set_my_email(text) from public;
grant execute on function public.set_my_email(text) to authenticated;
