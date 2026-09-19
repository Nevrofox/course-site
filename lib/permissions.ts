import type { Role } from '@/types/db';

export type Action = 'create' | 'update' | 'read' | 'delete' | 'leave';
export type Resource =
  | 'team'
  | 'team_member'
  | 'team_invitation'
  | 'team_audit_log'
  | 'team_webhook';

type RolePermissions = {
  [role in Role]: Permission[];
};

export type Permission = {
  resource: Resource;
  actions: Action[] | '*';
};

export const availableRoles: { id: Role; name: string }[] = [
  { id: 'MEMBER', name: 'Member' },
  { id: 'ADMIN', name: 'Admin' },
  { id: 'OWNER', name: 'Owner' },
];

export const permissions: RolePermissions = {
  OWNER: [
    {
      resource: 'team',
      actions: '*',
    },
    {
      resource: 'team_member',
      actions: '*',
    },
    {
      resource: 'team_invitation',
      actions: '*',
    },
    {
      resource: 'team_audit_log',
      actions: '*',
    },
    {
      resource: 'team_webhook',
      actions: '*',
    },
  ],
  ADMIN: [
    {
      resource: 'team',
      actions: '*',
    },
    {
      resource: 'team_member',
      actions: '*',
    },
    {
      resource: 'team_invitation',
      actions: '*',
    },
    {
      resource: 'team_audit_log',
      actions: '*',
    },
    {
      resource: 'team_webhook',
      actions: '*',
    },
  ],
  MEMBER: [
    {
      resource: 'team',
      actions: ['read', 'leave'],
    },
  ],
};
