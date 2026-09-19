import { faker } from '@faker-js/faker';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '../types/supabase';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const USER_COUNT = 10;
const TEAM_COUNT = 5;
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin@123';
const USER_EMAIL = 'user@example.com';
const USER_PASSWORD = 'user@123';

async function createRandomUser(email?: string, password?: string) {
  const finalEmail = email ?? faker.internet.email();
  const finalPassword = password ?? faker.internet.password();

  const { data, error } = await supabase.auth.admin.createUser({
    email: finalEmail,
    password: finalPassword,
    email_confirm: true,
    user_metadata: { name: faker.person.firstName() },
  });

  if (error) {
    console.error('Duplicate or invalid user', finalEmail, error.message);
    return null;
  }

  return data.user;
}

async function seedUsers() {
  const admin = await createRandomUser(ADMIN_EMAIL, ADMIN_PASSWORD);
  const user = await createRandomUser(USER_EMAIL, USER_PASSWORD);
  const rest = await Promise.all(
    Array(USER_COUNT)
      .fill(0)
      .map(() => createRandomUser())
  );

  const users = [admin, user, ...rest].filter(
    (u): u is NonNullable<typeof u> => !!u
  );
  console.log('Seeded users', users.length);
  return users;
}

async function seedTeams() {
  const teams = await Promise.all(
    Array(TEAM_COUNT)
      .fill(0)
      .map(async () => {
        const name = faker.company.name();
        const slug = name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .replace(/--+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');

        const { data, error } = await supabase
          .from('team')
          .insert({ name, slug })
          .select()
          .single();

        if (error) {
          console.error('Failed creating team', name, error.message);
          return null;
        }
        return data;
      })
  );

  const created = teams.filter((t): t is NonNullable<typeof t> => !!t);
  console.log('Seeded teams', created.length);
  return created;
}

async function seedTeamMembers(
  users: { id: string; email?: string }[],
  teams: { id: string }[]
) {
  const rows: { team_id: string; user_id: string; role: 'OWNER' | 'MEMBER' }[] =
    [];
  const roles = ['OWNER', 'MEMBER'] as const;

  for (const user of users) {
    const count = Math.floor(Math.random() * (TEAM_COUNT - 1)) + 2;
    const used = new Set<string>();

    for (let j = 0; j < count; j++) {
      let team;
      do {
        team = teams[Math.floor(Math.random() * teams.length)];
      } while (used.has(team.id));
      used.add(team.id);

      rows.push({
        team_id: team.id,
        user_id: user.id,
        role:
          user.email === ADMIN_EMAIL
            ? 'OWNER'
            : user.email === USER_EMAIL
              ? 'MEMBER'
              : roles[Math.floor(Math.random() * 2)],
      });
    }
  }

  const { error } = await supabase.from('team_member').insert(rows);
  if (error) {
    console.error('Failed seeding team members', error.message);
    return;
  }
  console.log('Seeded team members', rows.length);
}

async function seedInvitations(
  teams: { id: string }[],
  users: { id: string }[]
) {
  const rows: {
    team_id: string;
    email: string;
    role: 'MEMBER';
    invited_by: string;
    sent_via_email: true;
    allowed_domains: string[];
    token: string;
    expires: string;
  }[] = [];

  for (const team of teams) {
    const count = Math.floor(Math.random() * users.length) + 2;
    for (let j = 0; j < count; j++) {
      rows.push({
        team_id: team.id,
        invited_by: users[Math.floor(Math.random() * users.length)].id,
        email: faker.internet.email(),
        role: 'MEMBER',
        sent_via_email: true,
        allowed_domains: [],
        token: randomUUID(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  const { error } = await supabase.from('invitation').insert(rows);
  if (error) {
    console.error('Failed seeding invitations', error.message);
    return;
  }
  console.log('Seeded invitations', rows.length);
}

async function init() {
  const users = await seedUsers();
  const teams = await seedTeams();
  await seedTeamMembers(users, teams);
  await seedInvitations(teams, users);
}

init();
