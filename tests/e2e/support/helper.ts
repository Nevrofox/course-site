import { createAdminClient } from '@/lib/supabase/admin';

export const user = {
  name: 'Jackson',
  email: 'jackson@example.com',
  password: 'password',
} as const;

export const team = {
  name: 'Example',
  slug: 'example',
} as const;

export const secondTeam = {
  name: 'BoxyHQ',
  slug: 'boxyhq',
} as const;

export async function cleanup() {
  const supabase = createAdminClient();

  const { data: users } = await supabase.auth.admin.listUsers();
  const testUser = users?.users.find((u) => u.email === user.email);

  await supabase.from('team_member').delete().neq('id', '');
  await supabase.from('team').delete().neq('id', '');

  if (testUser) {
    await supabase.auth.admin.deleteUser(testUser.id);
  }
}
