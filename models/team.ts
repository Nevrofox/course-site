import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/session';
import { findOrCreateApp } from '@/lib/svix';
import { ApiError } from '@/lib/errors';
import type { Role, Team } from '@/types/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCurrentUser, normalizeUser } from './user';
import { validateWithSchema, teamSlugSchema } from '@/lib/zod';

export const createTeam = async (param: {
  userId: string;
  name: string;
  slug: string;
}) => {
  const { userId, name, slug } = param;
  const supabase = createAdminClient();

  const { data: team, error } = await supabase
    .from('team')
    .insert({ name, slug })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, error.message);
  }

  await addTeamMember(team.id, userId, 'OWNER');

  await findOrCreateApp(team.name, team.id);

  return team;
};

export const getTeam = async (
  key: { id: string } | { slug: string }
): Promise<Team> => {
  const supabase = createAdminClient();
  const query = supabase.from('team').select('*');

  const { data, error } =
    'id' in key
      ? await query.eq('id', key.id).single()
      : await query.eq('slug', key.slug).single();

  if (error || !data) {
    throw new ApiError(404, 'Team not found.');
  }

  return data;
};

export const deleteTeam = async (key: { id: string } | { slug: string }) => {
  const supabase = createAdminClient();
  const query = supabase.from('team').delete();

  const { error } =
    'id' in key ? await query.eq('id', key.id) : await query.eq('slug', key.slug);

  if (error) {
    throw new ApiError(500, error.message);
  }
};

export const addTeamMember = async (
  teamId: string,
  userId: string,
  role: Role
) => {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('team_member')
    .upsert(
      { team_id: teamId, user_id: userId, role },
      { onConflict: 'team_id,user_id' }
    )
    .select()
    .single();

  if (error) {
    throw new ApiError(500, error.message);
  }

  return data;
};

export const removeTeamMember = async (teamId: string, userId: string) => {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('team_member')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .select()
    .maybeSingle();

  if (error) {
    throw new ApiError(500, error.message);
  }

  return data;
};

export const getTeams = async (userId: string) => {
  const supabase = createAdminClient();

  const { data: memberships, error: membershipError } = await supabase
    .from('team_member')
    .select('team_id')
    .eq('user_id', userId);

  if (membershipError) {
    throw new ApiError(500, membershipError.message);
  }

  const teamIds = memberships?.map((m) => m.team_id) ?? [];

  if (teamIds.length === 0) {
    return [];
  }

  const { data: teams, error } = await supabase
    .from('team')
    .select('*, team_member(count)')
    .in('id', teamIds);

  if (error) {
    throw new ApiError(500, error.message);
  }

  return (teams ?? []).map(({ team_member, ...team }) => ({
    ...team,
    _count: { members: team_member?.[0]?.count ?? 0 },
  }));
};

export async function getTeamRoles(userId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('team_member')
    .select('team_id, role')
    .eq('user_id', userId);

  if (error) {
    throw new ApiError(500, error.message);
  }

  return data ?? [];
}

// Check if the user is an admin or owner of the team
export async function isTeamAdmin(userId: string, teamId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('team_member')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new ApiError(404, 'Team member not found.');
  }

  return data.role === 'ADMIN' || data.role === 'OWNER';
}

export const getTeamMembers = async (slug: string) => {
  const team = await getTeam({ slug });
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('team_member')
    .select('*, user(name, email, image)')
    .eq('team_id', team.id);

  if (error) {
    throw new ApiError(500, error.message);
  }

  return (data ?? []).map((member) => ({
    ...member,
    user: normalizeUser(member.user),
  }));
};

export const updateTeam = async (slug: string, data: Partial<Team>) => {
  const supabase = createAdminClient();

  const { data: team, error } = await supabase
    .from('team')
    .update(data)
    .eq('slug', slug)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      const target = error.message.includes('slug') ? 'slug' : 'domain';
      throw new ApiError(
        409,
        target === 'slug'
          ? 'This slug is already taken for a team.'
          : 'This domain is already associated with a team.'
      );
    }

    throw new ApiError(500, error.message);
  }

  return team;
};

export const isTeamExists = async (slug: string) => {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from('team')
    .select('*', { count: 'exact', head: true })
    .eq('slug', slug);

  if (error) {
    throw new ApiError(500, error.message);
  }

  return count ?? 0;
};

// Check if the current user has access to the team
// Should be used in API routes to check if the user has access to the team
export const throwIfNoTeamAccess = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getSession(req, res);

  if (!session) {
    throw new Error('Unauthorized');
  }

  const { slug } = validateWithSchema(teamSlugSchema, req.query);

  const teamMember = await getTeamMember(session.user.id, slug);

  return {
    ...teamMember,
    user: {
      ...session.user,
    },
  };
};

// Get the current user's team member object
export const getTeamMember = async (userId: string, slug: string) => {
  const team = await getTeam({ slug });
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('team_member')
    .select('*, team:team_id(*)')
    .eq('team_id', team.id)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new ApiError(403, 'You do not have access to this team.');
  }

  return data;
};

// Get current user with team info
export const getCurrentUserWithTeam = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const user = await getCurrentUser(req, res);

  const { slug } = validateWithSchema(teamSlugSchema, req.query);

  const { role, team } = await getTeamMember(user.id, slug);

  return {
    ...user,
    role,
    team,
  };
};

