-- Link-based invites (sent_via_email = false) have no specific invitee email.
alter table public.invitation alter column email drop not null;
alter table public.invitation drop constraint if exists invitation_team_id_email_key;
create unique index invitation_team_id_email_key on public.invitation (team_id, email) where email is not null;
