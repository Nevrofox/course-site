import env from '@/lib/env';
import { ApiError } from '@/lib/errors';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Invitation } from '@/types/db';
import { randomUUID } from 'crypto';

export type TeamInvitation = Pick<
  Invitation,
  'id' | 'email' | 'role' | 'expires' | 'allowed_domains' | 'token'
> & { url: string };

export const getInvitations = async (teamId: string, sentViaEmail: boolean) => {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('invitation')
    .select('id, email, role, expires, token, allowed_domains')
    .eq('team_id', teamId)
    .eq('sent_via_email', sentViaEmail);

  if (error) {
    throw new ApiError(500, error.message);
  }

  return (data ?? []).map((invitation) => ({
    ...invitation,
    url: `${env.appUrl}/invitations/${invitation.token}`,
  }));
};

export const getInvitation = async (
  key: { token: string } | { id: string }
) => {
  const supabase = createAdminClient();
  const query = supabase
    .from('invitation')
    .select('*, team:team_id(id, name, slug)');

  const { data, error } =
    'token' in key
      ? await query.eq('token', key.token).maybeSingle()
      : await query.eq('id', key.id).maybeSingle();

  if (error || !data) {
    throw new ApiError(404, 'Invitation not found.');
  }

  return data;
};

export const createInvitation = async (params: {
  teamId: string;
  invitedBy: string;
  email: string | null;
  role: Invitation['role'];
  sentViaEmail: boolean;
  allowedDomains: string[];
}) => {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('invitation')
    .insert({
      team_id: params.teamId,
      invited_by: params.invitedBy,
      email: params.email,
      role: params.role,
      sent_via_email: params.sentViaEmail,
      allowed_domains: params.allowedDomains,
      token: randomUUID(),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new ApiError(500, error.message);
  }

  return data;
};

export const deleteInvitation = async (
  key: { token: string } | { id: string }
) => {
  const supabase = createAdminClient();
  const query = supabase.from('invitation').delete();

  const { error } =
    'token' in key
      ? await query.eq('token', key.token)
      : await query.eq('id', key.id);

  if (error) {
    throw new ApiError(500, error.message);
  }
};

export const isInvitationExpired = async (expires: string) => {
  return new Date(expires).getTime() < Date.now();
};

export const getInvitationCount = async (params: {
  teamId: string;
  email: string;
}) => {
  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from('invitation')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', params.teamId)
    .eq('email', params.email);

  if (error) {
    throw new ApiError(500, error.message);
  }

  return count ?? 0;
};
