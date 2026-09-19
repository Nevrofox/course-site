import { createAdminClient } from '@/lib/supabase/admin';
import { ApiError } from '@/lib/errors';
import type { Role } from '@/types/db';

export const countTeamMembers = async (params: {
  teamId: string;
  role?: Role;
  email?: string;
}) => {
  const supabase = createAdminClient();
  const { teamId, role, email } = params;

  let query = supabase
    .from('team_member')
    .select('id, user!inner(email)', { count: 'exact', head: true })
    .eq('team_id', teamId);

  if (role) {
    query = query.eq('role', role);
  }

  if (email) {
    query = query.eq('user.email', email);
  }

  const { count, error } = await query;

  if (error) {
    throw new ApiError(500, error.message);
  }

  return count ?? 0;
};

export const updateTeamMember = async (
  teamId: string,
  userId: string,
  data: { role: Role }
) => {
  const supabase = createAdminClient();

  const { data: member, error } = await supabase
    .from('team_member')
    .update(data)
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new ApiError(500, error.message);
  }

  return member;
};
