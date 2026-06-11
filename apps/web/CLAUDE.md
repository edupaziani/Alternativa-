# apps/web — Claude Code Instructions

Next.js 14 App Router frontend for Sistema Alternativa. Read the root `CLAUDE.md` first — this file adds frontend-specific rules on top of it.

## Structure

```
apps/web/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Sidebar + header shell
│   │   ├── patients/
│   │   │   ├── page.tsx        # Patient list (server component)
│   │   │   ├── [id]/page.tsx   # Patient detail
│   │   │   └── new/page.tsx    # Create patient
│   │   ├── appointments/
│   │   ├── attendances/
│   │   ├── financials/
│   │   └── reports/
├── components/
│   ├── ui/                     # shadcn/ui components (auto-generated, don't edit)
│   ├── data-table/             # Reusable TanStack Table wrapper
│   ├── forms/                  # Reusable form components
│   └── [feature]/              # Feature-specific components
├── lib/
│   ├── api.ts                  # Fetch wrapper for API calls
│   ├── supabase.ts             # Supabase browser client
│   └── utils.ts                # cn(), formatters, validators
└── hooks/
    └── use-[feature].ts        # Data fetching hooks
```

## Server vs client components — follow this strictly

**Server components (default)** — use for:
- Initial data fetching (list pages, detail pages)
- Pages that don't need interactivity on load
- Anything that can be rendered on the server

**Client components (`'use client'`)** — use only for:
- Forms (react-hook-form requires client)
- Components with useState/useEffect
- Real-time updates
- Interactive UI (modals, dropdowns that need state)

**Rule: push `'use client'` as far down the tree as possible.** Page-level components should be server components whenever possible.

## Data fetching pattern

**In server components** (preferred):
```typescript
// app/(dashboard)/patients/page.tsx
export default async function PatientsPage() {
  const patients = await fetchPatients() // direct API call server-side
  return <PatientsTable initialData={patients} />
}
```

**In client components** (for interactive updates):
```typescript
// Use SWR for client-side data fetching
import useSWR from 'swr'

const { data, isLoading } = useSWR('/api/patients', fetcher)
```

## API call pattern — always use the shared fetcher

```typescript
// lib/api.ts is the single place for all API calls
import { api } from '@/lib/api'

// GET
const patients = await api.get<PaginatedResponse<Patient>>('/patients', { search: 'João' })

// POST
const patient = await api.post<Patient>('/patients', { name: 'João', cpf: '12345678901' })

// PUT
const updated = await api.put<Patient>(`/patients/${id}`, { name: 'João Silva' })
```

Never use raw `fetch()` directly in components. Always go through `lib/api.ts`.

## Form pattern — always use this structure

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreatePatientSchema, type CreatePatientInput } from '@alternativa/types'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function CreatePatientForm() {
  const form = useForm<CreatePatientInput>({
    resolver: zodResolver(CreatePatientSchema),
    defaultValues: { name: '', cpf: '' },
  })

  async function onSubmit(data: CreatePatientInput) {
    await api.post('/patients', data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Salvar
        </Button>
      </form>
    </Form>
  )
}
```

## Data table pattern — always use this for list pages

There are many list pages in this system (patients, appointments, revenues, etc.). Always use the shared `DataTable` wrapper, never build custom table markup:

```typescript
import { DataTable } from '@/components/data-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { Patient } from '@alternativa/types'

const columns: ColumnDef<Patient>[] = [
  { accessorKey: 'name', header: 'Nome' },
  { accessorKey: 'cpf', header: 'CPF' },
  { accessorKey: 'phone', header: 'Telefone' },
  {
    id: 'actions',
    cell: ({ row }) => <PatientActions patient={row.original} />,
  },
]

export function PatientsTable({ data }: { data: Patient[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumn="name"
      searchPlaceholder="Buscar paciente..."
    />
  )
}
```

## shadcn/ui usage

- Always use shadcn components from `@/components/ui/` for: Button, Input, Select, Dialog, Sheet, Tabs, Card, Badge, etc.
- Never build custom versions of things shadcn already provides.
- Add new shadcn components with: `pnpm dlx shadcn-ui@latest add [component]`
- Never edit files inside `components/ui/` directly — they are managed by shadcn CLI.

## Brazilian formatting helpers — always use these

```typescript
import { formatCPF, formatPhone, formatCEP, formatMoney, formatDate } from '@/lib/utils'

formatCPF('12345678901')        // → '123.456.789-01'
formatPhone('19996041380')      // → '(19) 99604-1380'
formatCEP('13400000')           // → '13400-000'
formatMoney(15000)              // → 'R$ 150,00' (input is centavos)
formatDate('2024-08-19')        // → '19/08/2024'
```

Never format these manually inline in components.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Running

```bash
pnpm dev        # next dev
pnpm build      # next build
pnpm start      # next start
pnpm lint       # next lint
pnpm typecheck  # tsc --noEmit
```