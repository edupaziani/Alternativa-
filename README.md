# Sistema Alternativa

Clinic management system for Clínica Alternativa. Replaces a legacy ASP.NET WebForms system (~50k patients, 590+ professionals, multi-specialty).

## Stack

| Layer | Choice |
|---|---|
| API | Fastify 4 + TypeScript |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth + RLS |
| Frontend | Next.js 14 App Router + Tailwind CSS |

## Local development

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) 9+
- [Docker](https://www.docker.com) (required by Supabase local stack)
- [Supabase CLI](https://supabase.com/docs/guides/cli) — `brew install supabase/tap/supabase`

### First-time setup

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env files and fill in values
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Start local Supabase (Postgres + Auth + Storage + Studio)
supabase start

# 4. Paste the printed anon key and service role key into apps/api/.env and apps/web/.env

# 5. Regenerate TypeScript types from the local schema
pnpm db:types

# 6. Start all apps
pnpm dev
```

### Daily workflow

```bash
supabase start   # start local DB (if not already running)
pnpm dev         # start API (port 3001) + web (port 3000) in parallel
```

Supabase Studio is available at **http://127.0.0.1:54323** when the local stack is running.

### Database commands

```bash
pnpm db:types   # regenerate packages/types/src/supabase.ts from local schema
pnpm db:reset   # reset local DB and re-run all migrations + seed
pnpm db:push    # push local migrations to remote Supabase project
```

### Migrations

All schema changes go through migration files in `supabase/migrations/`. Never edit the DB directly.

```bash
# Create a new migration
supabase migration new <name>

# Apply migrations locally
pnpm db:reset

# Regenerate types after schema change
pnpm db:types
```
