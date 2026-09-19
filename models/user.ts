import { ApiError } from '@/lib/errors';
import { Action, Resource, permissions } from '@/lib/permissions';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession, type Session } from '@/lib/session';
import { maxLengthPolicies } from '@/lib/common';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Role, TeamMember, User } from '@/types/db';

export const normalizeUser = <T extends { name?: string | null }>(
  user: T
): T => {
  if (user?.name) {
    user.name = user.name.substring(0, maxLengthPolicies.name);
  }

  return user;
};

// Update the user's profile (name/image live in public.user; email/password are
// owned by Supabase Auth and updated separately via the admin client).
export const updateUser = async (
  userId: string,
  data: Partial<Pick<User, 'name' | 'image'>>
) => {
  const supabase = createAdminClient();

  const { data: user, error } = await supabase
    .from('user')
    .update(normalizeUser({ ...data }))
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new ApiError(500, error.message);
  }

  return normalizeUser(user);
};

export const getUser = async (
  key: { id: string } | { email: string }
): Promise<User | null> => {
  const supabase = createAdminClient();
  let query = supabase.from('user').select('*');

  query =
    'id' in key ? query.eq('id', key.id) : query.ilike('email', key.email);

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new ApiError(500, error.message);
  }

  return data ? normalizeUser(data) : null;
};

export const getUserBySession = async (session: Session | null) => {
  const id = session?.user?.id;

  if (!id) {
    return null;
  }

  return await getUser({ id });
};

const isAllowed = (role: Role, resource: Resource, action: Action) => {
  const rolePermissions = permissions[role];

  if (!rolePermissions) {
    return false;
  }

  for (const permission of rolePermissions) {
    if (
      permission.resource === resource &&
      (permission.actions === '*' || permission.actions.includes(action))
    ) {
      return true;
    }
  }

  return false;
};

export const throwIfNotAllowed = (
  user: Pick<TeamMember, 'role'>,
  resource: Resource,
  action: Action
) => {
  if (isAllowed(user.role, resource, action)) {
    return true;
  }

  throw new ApiError(
    403,
    `You are not allowed to perform ${action} on ${resource}`
  );
};

// Get current user from session
export const getCurrentUser = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getSession(req, res);

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session.user;
};
