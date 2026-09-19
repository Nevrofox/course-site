-- Restore the original invitation link mechanism (own token/expiry, independent of
-- Supabase Auth's own invite/reset links) so admins can invite either via email or a
-- shareable, domain-restricted link, matching the app's existing invitation UX.

alter table public.invitation
  add column token text,
  add column expires timestamptz,
  add column sent_via_email boolean not null default true;

update public.invitation set token = gen_random_uuid()::text where token is null;
update public.invitation set expires = now() + interval '7 days' where expires is null;

alter table public.invitation
  alter column token set not null,
  alter column expires set not null;

create unique index invitation_token_key on public.invitation (token);
