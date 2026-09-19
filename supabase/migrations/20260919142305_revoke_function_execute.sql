-- Postgres grants EXECUTE to PUBLIC by default on new functions, which makes these
-- internal SECURITY DEFINER helpers callable directly via PostgREST RPC. Lock them
-- down: trigger functions need no direct callers at all; the RLS helper functions
-- are invoked by policies under `authenticated` and should not be anon-callable.

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_user_email_change() from public;
revoke execute on function public.rls_auto_enable() from public;

revoke execute on function public.current_team_role(uuid) from public;
revoke execute on function public.is_team_member(uuid) from public;

-- Re-affirm the intentional grants (RLS policies run as `authenticated`).
grant execute on function public.current_team_role(uuid) to authenticated;
grant execute on function public.is_team_member(uuid) to authenticated;
