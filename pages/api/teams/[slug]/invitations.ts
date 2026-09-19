import { sendTeamInviteEmail } from '@/lib/email/sendTeamInviteEmail';
import { ApiError } from '@/lib/errors';
import { sendAudit } from '@/lib/retraced';
import { getSession } from '@/lib/session';
import { sendEvent } from '@/lib/svix';
import {
  createInvitation,
  deleteInvitation,
  getInvitation,
  getInvitationCount,
  getInvitations,
  isInvitationExpired,
} from 'models/invitation';
import { addTeamMember, throwIfNoTeamAccess } from 'models/team';
import { throwIfNotAllowed } from 'models/user';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { extractEmailDomain, isEmailAllowed } from '@/lib/email/utils';
import type { Invitation, Role } from '@/types/db';
import { countTeamMembers } from 'models/teamMember';
import {
  acceptInvitationSchema,
  deleteInvitationSchema,
  getInvitationsSchema,
  inviteViaEmailSchema,
  validateWithSchema,
} from '@/lib/zod';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGET(req, res);
        break;
      case 'POST':
        await handlePOST(req, res);
        break;
      case 'PUT':
        await handlePUT(req, res);
        break;
      case 'DELETE':
        await handleDELETE(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST, PUT, DELETE');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

// Invite a user to a team
const handlePOST = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_invitation', 'create');

  const { email, role, sentViaEmail, domains } = validateWithSchema(
    inviteViaEmailSchema,
    req.body
  ) as {
    email?: string;
    role: Role;
    sentViaEmail: boolean;
    domains?: string;
  };

  let invitation: undefined | Invitation = undefined;

  // Invite via email
  if (sentViaEmail) {
    if (!email) {
      throw new ApiError(400, 'Email is required.');
    }

    if (!isEmailAllowed(email)) {
      throw new ApiError(
        400,
        'It seems you entered a non-business email. Invitations can only be sent to work emails.'
      );
    }

    /*
    Aggregate  (cost=12.61..12.62 rows=1 width=8) (actual time=0.040..0.040 rows=1 loops=1)
    */
    const memberExists = await countTeamMembers({
      teamId: teamMember.team_id,
      email,
    });

    if (memberExists) {
      throw new ApiError(400, 'This user is already a member of the team.');
    }

    const invitationExists = await getInvitationCount({
      teamId: teamMember.team_id,
      email,
    });

    if (invitationExists) {
      throw new ApiError(400, 'An invitation already exists for this email.');
    }

    invitation = await createInvitation({
      teamId: teamMember.team_id,
      invitedBy: teamMember.user_id,
      email,
      role,
      sentViaEmail: true,
      allowedDomains: [],
    });
  }

  // Invite via link
  if (!sentViaEmail) {
    invitation = await createInvitation({
      teamId: teamMember.team_id,
      invitedBy: teamMember.user_id,
      role,
      email: null,
      sentViaEmail: false,
      allowedDomains: domains
        ? domains.split(',').map((d) => d.trim().toLowerCase())
        : [],
    });
  }

  if (!invitation) {
    throw new ApiError(400, 'Could not create invitation. Please try again.');
  }

  if (invitation.sent_via_email) {
    await sendTeamInviteEmail(teamMember.team, invitation);
  }

  await sendEvent(teamMember.team_id, 'invitation.created', invitation);

  sendAudit({
    action: 'member.invitation.create',
    crud: 'c',
    user: teamMember.user,
    team: teamMember.team,
  });

  recordMetric('invitation.created');

  res.status(204).end();
};

// Get all invitations for a team
const handleGET = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_invitation', 'read');

  const { sentViaEmail } = validateWithSchema(
    getInvitationsSchema,
    req.query as { sentViaEmail: string }
  );

  const invitations = await getInvitations(
    teamMember.team_id,
    sentViaEmail === 'true'
  );

  recordMetric('invitation.fetched');

  res.status(200).json({ data: invitations });
};

// Delete an invitation
const handleDELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const teamMember = await throwIfNoTeamAccess(req, res);
  throwIfNotAllowed(teamMember, 'team_invitation', 'delete');

  const { id } = validateWithSchema(
    deleteInvitationSchema,
    req.query as { id: string }
  );

  const invitation = await getInvitation({ id });

  if (
    invitation.invited_by != teamMember.user.id ||
    invitation.team.id != teamMember.team_id
  ) {
    throw new ApiError(
      400,
      `You don't have permission to delete this invitation.`
    );
  }

  await deleteInvitation({ id });

  sendAudit({
    action: 'member.invitation.delete',
    crud: 'd',
    user: teamMember.user,
    team: teamMember.team,
  });

  await sendEvent(teamMember.team_id, 'invitation.removed', invitation);

  recordMetric('invitation.removed');

  res.status(200).json({ data: {} });
};

// Accept an invitation to an organization
const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const { inviteToken } = validateWithSchema(
    acceptInvitationSchema,
    req.body as { inviteToken: string }
  );

  const invitation = await getInvitation({ token: inviteToken });

  if (await isInvitationExpired(invitation.expires)) {
    throw new ApiError(400, 'Invitation expired. Please request a new one.');
  }

  const session = await getSession(req, res);
  const email = session?.user.email as string;

  // Make sure the user is logged in with the invited email address (Join via email)
  if (invitation.sent_via_email && invitation.email !== email) {
    throw new ApiError(
      400,
      'You must be logged in with the email address you were invited with.'
    );
  }

  // Make sure the user is logged in with an allowed domain (Join via link)
  if (!invitation.sent_via_email && invitation.allowed_domains.length) {
    const emailDomain = extractEmailDomain(email);
    const allowJoin = invitation.allowed_domains.find(
      (domain) => domain === emailDomain
    );

    if (!allowJoin) {
      throw new ApiError(
        400,
        'You must be logged in with an email address from an allowed domain.'
      );
    }
  }

  const teamMember = await addTeamMember(
    invitation.team.id,
    session?.user?.id as string,
    invitation.role
  );

  await sendEvent(invitation.team.id, 'member.created', teamMember);

  if (invitation.sent_via_email) {
    await deleteInvitation({ token: inviteToken });
  }

  recordMetric('member.created');

  res.status(204).end();
};
