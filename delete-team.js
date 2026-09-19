/* eslint-disable @typescript-eslint/no-var-requires */
const readline = require('readline');
const { Svix } = require('svix');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const svix = process.env.SVIX_API_KEY
  ? new Svix(`${process.env.SVIX_API_KEY}`)
  : undefined;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let dryRun = true;

init();

async function init() {
  if (process.argv.length < 3) {
    console.log(
      `
      Usage:
        node delete-team.js [options] <teamId> [teamId]
        npm run delete-team -- [options] <teamId> [teamId]

      Options:
        --apply: Run the script to apply changes
        `
    );
    process.exit(1);
  }

  let i = 2;
  if (process.argv.map((a) => a.toLowerCase()).includes('--apply')) {
    console.log('Running in apply mode');
    dryRun = false;
    i++;
  } else {
    console.log('Running in dry-run mode');
  }

  for (i; i < process.argv.length; i++) {
    const teamId = process.argv[i];
    try {
      await displayDeletionArtifacts(teamId);

      if (!dryRun) {
        const confirmed = await askForConfirmation(teamId);
        if (confirmed) {
          await handleTeamDeletion(teamId);
        }
      }
    } catch (error) {
      console.log('Error deleting team:', error?.message);
    }
  }

  rl.close();
  process.exit(0);
}

async function displayDeletionArtifacts(teamId) {
  const team = await getTeamById(teamId);
  if (!team) {
    throw new Error(`Team not found: ${teamId}`);
  }
  console.log('\nTeam Details:');
  printTable([team], ['id', 'name', 'slug']);

  const { data: members } = await supabase
    .from('team_member')
    .select('user_id, role, user:user_id(email, name)')
    .eq('team_id', teamId);
  console.log('\nTeam Members:');
  printTable(members ?? [], ['user_id', 'role']);

  const { data: invitations } = await supabase
    .from('invitation')
    .select('id, email, role')
    .eq('team_id', teamId);
  if (invitations?.length) {
    console.log('\nInvitations:');
    printTable(invitations, ['id', 'email', 'role']);
  } else {
    console.log('\nNo invitations found');
  }

  if (svix) {
    console.log('\nChecking Svix application');
    const application = await getSvixApplication(teamId);
    if (!application) {
      console.log('No Svix application found');
    } else {
      printTable([application], ['id', 'name', 'uid']);
    }
  }
}

async function handleTeamDeletion(teamId) {
  const team = await getTeamById(teamId);
  if (!team) {
    console.log(`Team not found: ${teamId}`);
    return;
  }

  await removeSvixApplication(teamId);

  // team_member and invitation rows cascade-delete via FK ON DELETE CASCADE.
  const { error } = await supabase.from('team').delete().eq('id', teamId);
  if (error) {
    throw new Error(error.message);
  }

  console.log(`Deleted team: ${team.name} (${teamId})`);
}

async function getTeamById(teamId) {
  const { data } = await supabase
    .from('team')
    .select('*')
    .eq('id', teamId)
    .maybeSingle();
  return data;
}

async function getSvixApplication(teamId) {
  if (!svix) return null;
  try {
    return await svix.application.get(teamId);
  } catch {
    return null;
  }
}

async function removeSvixApplication(teamId) {
  if (!svix) return;
  const application = await getSvixApplication(teamId);
  if (application) {
    await svix.application.delete(application.id);
  }
}

function printTable(rows, columns) {
  if (!rows.length) return;
  console.table(
    rows.map((row) => Object.fromEntries(columns.map((c) => [c, row[c]])))
  );
}

function askForConfirmation(teamId) {
  return new Promise((resolve) => {
    rl.question(
      `\nAre you sure you want to delete team ${teamId}? (yes/no) `,
      (answer) => resolve(answer.trim().toLowerCase() === 'yes')
    );
  });
}
