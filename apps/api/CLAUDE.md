# apps/api — Claude Code Instructions

Fastify REST API for Sistema Alternativa. Read the root `CLAUDE.md` first — this file adds API-specific rules on top of it.

## Structure

```
apps/api/src/
├── index.ts              # Entry point — registers plugins and starts server
├── plugins/
│   ├── auth.ts           # Supabase JWT validation plugin (decorate request.user)
│   ├── supabase.ts       # Supabase client plugin (decorate fastify.supabase)
│   └── errors.ts         # Global error handler
├── routes/
│   ├── patients/
│   │   ├── index.ts      # Route registration
│   │   ├── schema.ts     # Zod schemas for request/response
│   │   └── handlers.ts   # Route handlers
│   ├── appointments/
│   ├── attendances/
│   ├── professionals/
│   ├── financials/
│   └── ...
└── lib/
    ├── supabase.ts       # Supabase client factory
    └── errors.ts         # AppError class
```

## How to add a new route — always follow this pattern

**1. Create the schema file** (`routes/[entity]/schema.ts`):
```typescript
import { z } from 'zod'

export const CreatePatientSchema = z.object({
  name: z.string().min(1),
  cpf: z.string().length(11),
  phone: z.string().optional(),
  convenioId: z.string().uuid().optional(),
})

export const PatientResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  cpf: z.string(),
  phone: z.string().nullable(),
  createdAt: z.string(),
})

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>
```

**2. Create the handlers file** (`routes/[entity]/handlers.ts`):
```typescript
import type { FastifyRequest, FastifyReply } from 'fastify'
import type { CreatePatientInput } from './schema'
import { AppError } from '../../lib/errors'

export async function createPatient(
  request: FastifyRequest<{ Body: CreatePatientInput }>,
  reply: FastifyReply
) {
  const { supabase } = request.server
  const { data, error } = await supabase
    .from('patients')
    .insert({ ...request.body, created_by: request.user.id })
    .select()
    .single()

  if (error) throw new AppError('CREATE_PATIENT_FAILED', error.message, 500)

  return reply.status(201).send(data)
}
```

**3. Create the index file** (`routes/[entity]/index.ts`):
```typescript
import type { FastifyPluginAsync } from 'fastify'
import { CreatePatientSchema } from './schema'
import { createPatient } from './handlers'

const patientRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/', {
    preHandler: [fastify.authenticate], // always add auth to protected routes
    schema: {
      body: CreatePatientSchema,
    },
    handler: createPatient,
  })
}

export default patientRoutes
```

## Auth plugin usage

Every protected route must use `preHandler: [fastify.authenticate]`.

After authentication, `request.user` is available with:
```typescript
{
  id: string        // Supabase user UUID
  email: string
  role: 'admin' | 'professional' | 'receptionist' | 'financial'
}
```

**Never skip `fastify.authenticate` on any route that touches patient or financial data.**

## Supabase client

Always use `request.server.supabase` inside handlers — this is the user-scoped client that respects RLS.

Never use the service role client (`supabase_admin`) in route handlers. Only use it in migration scripts and seed files.

## Pagination — always use this pattern

All list endpoints must support pagination:

```typescript
// Query params
const { page = 1, limit = 20, search } = request.query

const from = (page - 1) * limit
const to = from + limit - 1

const { data, count } = await supabase
  .from('patients')
  .select('*', { count: 'exact' })
  .ilike('name', search ? `%${search}%` : '%')
  .is('deleted_at', null)
  .range(from, to)

return {
  data,
  pagination: {
    page,
    limit,
    total: count ?? 0,
    totalPages: Math.ceil((count ?? 0) / limit),
  },
}
```

## Environment variables

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # only for scripts, never in handlers
PORT=3001
NODE_ENV=development|production
```

## Running

```bash
pnpm dev      # tsx watch src/index.ts
pnpm build    # tsc
pnpm start    # node dist/index.js
pnpm lint     # eslint src/
pnpm typecheck # tsc --noEmit
```