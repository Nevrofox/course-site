# Nevrofox AI-kurs

A SaaS platform for AI-generated courses sold to businesses. A business signs up, creates a **team** (their organization/workspace), and generates custom courses for their employees. Team owners/admins can invite colleagues to their team, assign roles, and manage settings, webhooks, and audit logs.

> Note: "team" in the code refers to a business/customer organization, not an internal engineering team.

## Tech stack

- **Framework**: Next.js 15 (Pages Router), TypeScript
- **Database & Auth**: [Supabase](https://supabase.com) (Postgres + Supabase Auth, via `supabase-js` and `@supabase/ssr`)
- **Styling**: Tailwind CSS + daisyUI
- **Webhooks**: Svix
- **Audit logs**: Retraced
- **i18n**: next-i18next (English/Norwegian)
- **Testing**: Jest (unit), Playwright (e2e)

## Core features

- Email/password authentication via Supabase Auth (signup, login, password reset)
- Teams (businesses): create a team, invite members by email or shareable link, manage roles (OWNER/ADMIN/MEMBER)
- Role-based access control per team (`lib/permissions.ts`, `lib/rbac.ts`)
- AI-generated course content per team (`components/courses/*`, `lib/course.ts`)
- Team webhooks (Svix) and audit logs (Retraced)
- Account settings: update profile, change password

## Getting started

### Prerequisites

- Node.js 22+
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) (`npm i -g supabase` or use `npx supabase`)
- Docker (required by the Supabase CLI to run the local stack)

### 1. Install dependencies

```bash
npm install
```

### 2. Start Supabase locally

```bash
npm run supabase:start
```

This boots a local Postgres, Auth, Storage, and Studio via Docker. The command prints local API URL and keys — copy them into `.env.local` (see `.env.example`). A `.env.local` file (gitignored) can override `.env` for local development so you don't need to touch your production Supabase credentials.

Local email flows (signup confirmation, password reset) can be inspected at the local Mailpit inbox printed by the CLI (typically `http://127.0.0.1:54324`).

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the values (SMTP, Svix, Retraced, Supabase project URL/keys, etc). See `.env.example` for the full list and comments.

### 4. Run the app

```bash
npm run dev
```

The app runs at [http://localhost:4002](http://localhost:4002).

### 5. (Optional) Seed demo data

```bash
npm run seed
```

Creates demo users, teams, memberships, and invitations against whichever Supabase project your `.env`/`.env.local` points at.

## Database schema & migrations

Schema, RLS policies, and Postgres functions live in `supabase/migrations/`. To change the schema:

```bash
supabase migration new <name>
# edit the new file in supabase/migrations/
npm run supabase:reset      # re-applies all migrations locally
npm run supabase:types      # regenerates types/supabase.ts
```

When ready to ship a change to the hosted project:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

## Scripts

| Script                                                         | Description                                        |
| -------------------------------------------------------------- | -------------------------------------------------- |
| `npm run dev`                                                  | Start the dev server on port 4002                  |
| `npm run build`                                                | Production build                                   |
| `npm run start`                                                | Start the production server                        |
| `npm run check-types`                                          | TypeScript type-check                              |
| `npm run check-lint`                                           | ESLint                                             |
| `npm run check-format`                                         | Prettier check                                     |
| `npm run test`                                                 | Jest unit tests                                    |
| `npm run test:e2e`                                             | Playwright e2e tests                               |
| `npm run supabase:start` / `supabase:reset` / `supabase:types` | Local Supabase stack helpers                       |
| `npm run seed`                                                 | Seed demo data via Supabase                        |
| `npm run delete-team -- <teamId>`                              | Admin script to inspect/delete a team and its data |

## Deployment

CI (`.github/workflows/main.yml`) lints, type-checks, tests, and builds against a local Supabase stack on every push/PR. Deploy the Next.js app to your hosting provider of choice and point it at your hosted Supabase project via the same environment variables used locally (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). Make sure all migrations in `supabase/migrations/` have been pushed to the hosted project (`supabase db push`) before deploying.
