-- The project's baseline migration revokes default table privileges from all roles and
-- only re-grants MAINTAIN/REFERENCES/TRIGGER/TRUNCATE (not SELECT/INSERT/UPDATE/DELETE).
-- RLS policies restrict *rows*, but Postgres still requires a base GRANT for the operation
-- to be attempted at all — service_role bypasses RLS but still needs the underlying GRANT.
grant select, insert, update, delete on public.user, public.team, public.team_member, public.invitation
  to service_role;

grant select, insert, update, delete on public.user, public.team, public.team_member, public.invitation
  to authenticated;

-- Apply the same grants automatically to any future tables created in `public`.
alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to service_role;

alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to authenticated;
