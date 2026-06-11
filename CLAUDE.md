# Sistema Alternativa — Claude Code Instructions

## Project overview

Clinic management system for Clínica Alternativa, replacing a legacy ASP.NET WebForms system (Mediato). ~50k patients, 590+ professionals, multi-specialty. Solo dev, built with Claude Code.

## Monorepo structure

```
/
├── apps/
│   ├── api/          # Fastify + TypeScript — REST API
│   └── web/          # Next.js 14 App Router — frontend
├── packages/
│   └── types/        # Shared domain types consumed by both apps
├── supabase/
│   └── migrations/   # All DB migrations managed via Supabase CLI
├── CLAUDE.md         # This file
└── pnpm-workspace.yaml
```

## Running the project

```bash
# Start local Supabase (Postgres + Auth + Storage)
supabase start

# Start all apps in dev mode
pnpm dev

# API only
pnpm --filter api dev

# Web only
pnpm --filter web dev

# Regenerate TypeScript types from Supabase schema (run after any migration)
supabase gen types typescript --local > packages/types/src/supabase.ts

# Run all checks before committing
pnpm typecheck && pnpm lint
```

## Tech stack

| Layer | Choice |
|---|---|
| API | Fastify 4 + TypeScript |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth + RLS |
| Frontend | Next.js 14 App Router + Tailwind CSS |
| UI components | shadcn/ui |
| Data grids | TanStack Table v8 |
| Forms | react-hook-form + zod |
| Storage | Supabase Storage |
| Background jobs | n8n (external, webhook-driven) |
| Notifications | Meta Cloud API (WhatsApp) + Resend (email) |
| PDF | @react-pdf/renderer |
| Infrastructure | Docker + Coolify on VPS |

## TypeScript rules — always enforce these

- **Never use `any`**. Use `unknown` and narrow, or use the correct type from `packages/types`.
- **Never inline domain types**. All domain types (Patient, Appointment, Professional, etc.) live in `packages/types/src/`. Import from there.
- **Always import shared types as**: `import type { Patient } from '@alternativa/types'`
- Zod schemas live alongside their types in `packages/types/src/` and are named `[Entity]Schema`.
- After any Supabase schema change, regenerate types with `supabase gen types` before writing application code.

## Database rules — always enforce these

- **Never write raw SQL in application code**. Use the Supabase client.
- **Never bypass RLS**. Use the user-scoped Supabase client (`supabase` from the request context), never the service role client except in server-side scripts.
- **Soft deletes only**. All tables with user data have a `deleted_at timestamptz` column. Use `WHERE deleted_at IS NULL` in all queries. Never hard delete.
- **All monetary values are stored as integers (centavos)**. Never store floats for money. Display layer handles formatting.
- **All timestamps are UTC** in the DB. Format to `America/Sao_Paulo` only in the display layer.

## Error handling — always enforce these

- API errors always return this shape:
```json
{
  "error": {
    "code": "PATIENT_NOT_FOUND",
    "message": "Paciente não encontrado",
    "statusCode": 404
  }
}
```
- Use the shared `AppError` class from `packages/types/src/errors.ts` to throw errors.
- Never return stack traces to the client.
- Always log errors server-side with the request ID.

## Branch naming

Linear generates branch names automatically. Always use the Linear-generated branch name format:
`eduschuerman/alt-{number}-{slug}`

Example: `eduschuerman/alt-12-scheduling-module-professional-agenda`

## Linear issue tracking

This project uses Linear (workspace: Alternativa). Issues are organized in 3 cycles:

- **Cycle 1** (ALT-5 to ALT-11): Foundations — monorepo, Supabase, schema, auth, patients, professionals, CI/CD
- **Cycle 2** (ALT-12, 13, 16, 17): Clinical core — scheduling, attendance, notifications, PDFs
- **Cycle 3** (ALT-14, 15, 18): Financial + compliance — financials, TISS/DMED, reports

When starting work on an issue, check its Linear description for the full spec, acceptance criteria, and API contract before writing any code.

## Brazilian healthcare domain — key concepts

- **Paciente** = Patient
- **Profissional** = Doctor/staff member
- **Atendimento** = Clinical attendance/appointment record
- **Agendamento** = Scheduled appointment slot
- **Convenio** = Health insurance plan (e.g. Hapvida, Unimed, Particular)
- **CID-10** = International disease classification codes (seed data)
- **TUSS** = Procedure codes for insurance billing (seed data)
- **TISS** = ANS XML billing standard for convenios
- **DMED** = Annual Receita Federal tax declaration for medical services
- **CEP** = Brazilian postal code (lookup via ViaCEP API)
- **CPF** = Brazilian individual tax ID (11 digits, validated via algorithm)
- **CNPJ** = Brazilian company tax ID (14 digits, validated via algorithm)

## What NOT to do

- Do not install new dependencies without checking if an existing package in the monorepo already solves the problem.
- Do not create new database tables without a corresponding Supabase migration file.
- Do not add client-side state management libraries (Redux, Zustand, Jotai). Use React state + server components.
- Do not use `localStorage` for anything sensitive (tokens, patient data). Supabase handles auth storage.
- Do not skip Zod validation on any API endpoint — request and response must both be validated.
- Do not create duplicate types. Check `packages/types/src/` before defining anything new.