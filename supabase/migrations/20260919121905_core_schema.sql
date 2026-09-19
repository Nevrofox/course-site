-- Core application schema: user profiles, teams, team membership, invitations.
-- Auth (password, sessions, email verification, tokens) is owned entirely by Supabase Auth (auth.users).

create type public.role as enum ('OWNER', 'ADMIN', 'MEMBER');

create table public.user (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  domain text unique,
  default_role public.role not null default 'MEMBER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_member (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.team (id) on delete cascade,
  user_id uuid not null references public.user (id) on delete cascade,
  role public.role not null default 'MEMBER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, user_id)
);

create index team_member_team_id_idx on public.team_member (team_id);
create index team_member_user_id_idx on public.team_member (user_id);

-- Tracks a pending team invite; the actual invite email/token/link is issued by
-- supabase.auth.admin.inviteUserByEmail(). This row carries the team/role context
-- and lets the team UI list/revoke pending invites.
create table public.invitation (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.team (id) on delete cascade,
  email text not null,
  role public.role not null default 'MEMBER',
  invited_by uuid not null references public.user (id) on delete cascade,
  allowed_domains text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (team_id, email)
);

create index invitation_team_id_idx on public.invitation (team_id);
create index invitation_email_idx on public.invitation (email);

-- Keeps updated_at current on row updates.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_set_updated_at before update on public.user
  for each row execute function public.set_updated_at();

create trigger team_set_updated_at before update on public.team
  for each row execute function public.set_updated_at();

create trigger team_member_set_updated_at before update on public.team_member
  for each row execute function public.set_updated_at();

-- Creates the public.user profile row whenever Supabase Auth creates a new user.
-- SECURITY DEFINER is required here: this runs in response to an insert into auth.users
-- (owned by the supabase_auth_admin role), so it must bypass RLS to create the matching profile row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper functions used by RLS policies below. SECURITY DEFINER is required to check
-- team_member rows without recursively re-applying team_member's own RLS policies;
-- both only ever check membership/role for the *current* auth.uid(), never an arbitrary user.
create or replace function public.is_team_member(_team_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.team_member
    where team_id = _team_id and user_id = (select auth.uid())
  );
$$;

create or replace function public.current_team_role(_team_id uuid)
returns public.role
language sql
security definer
stable
set search_path = ''
as $$
  select role from public.team_member
  where team_id = _team_id and user_id = (select auth.uid())
  limit 1;
$$;

grant execute on function public.is_team_member(uuid) to authenticated;
grant execute on function public.current_team_role(uuid) to authenticated;

alter table public.user enable row level security;
alter table public.team enable row level security;
alter table public.team_member enable row level security;
alter table public.invitation enable row level security;

-- user: read own profile, or profiles of people who share a team with you; update only your own row.
create policy "user_select_self_or_teammate" on public.user
  for select
  to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1 from public.team_member tm
      where tm.user_id = public.user.id
        and public.is_team_member(tm.team_id)
    )
  );

create policy "user_update_self" on public.user
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- team: readable by members; creatable by any authenticated user (signup flow creates a team);
-- updatable/deletable only by OWNER/ADMIN of that team.
create policy "team_select_member" on public.team
  for select
  to authenticated
  using (public.is_team_member(id));

create policy "team_insert_authenticated" on public.team
  for insert
  to authenticated
  with check (true);

create policy "team_update_admin" on public.team
  for update
  to authenticated
  using (public.current_team_role(id) in ('OWNER', 'ADMIN'))
  with check (public.current_team_role(id) in ('OWNER', 'ADMIN'));

create policy "team_delete_owner" on public.team
  for delete
  to authenticated
  using (public.current_team_role(id) = 'OWNER');

-- team_member: readable by teammates; writes restricted to OWNER/ADMIN of that team.
create policy "team_member_select_teammate" on public.team_member
  for select
  to authenticated
  using (public.is_team_member(team_id));

create policy "team_member_insert_admin" on public.team_member
  for insert
  to authenticated
  with check (public.current_team_role(team_id) in ('OWNER', 'ADMIN'));

create policy "team_member_update_admin" on public.team_member
  for update
  to authenticated
  using (public.current_team_role(team_id) in ('OWNER', 'ADMIN'))
  with check (public.current_team_role(team_id) in ('OWNER', 'ADMIN'));

create policy "team_member_delete_admin_or_self" on public.team_member
  for delete
  to authenticated
  using (
    public.current_team_role(team_id) in ('OWNER', 'ADMIN')
    or user_id = (select auth.uid())
  );

-- invitation: only OWNER/ADMIN of the team can list, create, or revoke invites.
create policy "invitation_select_admin" on public.invitation
  for select
  to authenticated
  using (public.current_team_role(team_id) in ('OWNER', 'ADMIN'));

create policy "invitation_insert_admin" on public.invitation
  for insert
  to authenticated
  with check (public.current_team_role(team_id) in ('OWNER', 'ADMIN'));

create policy "invitation_delete_admin" on public.invitation
  for delete
  to authenticated
  using (public.current_team_role(team_id) in ('OWNER', 'ADMIN'));
