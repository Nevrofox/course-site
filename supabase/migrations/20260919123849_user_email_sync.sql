-- Denormalize auth.users.email onto public.user so app queries never need the Admin API
-- just to look up a user by email (invitations, "does this email already have an account" checks).

alter table public.user add column email text;

update public.user u
set email = a.email
from auth.users a
where a.id = u.id;

alter table public.user alter column email set not null;
create unique index user_email_key on public.user (lower(email));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

-- Keeps public.user.email current if a user changes their email in Supabase Auth.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is distinct from old.email then
    update public.user set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row execute function public.handle_user_email_change();
