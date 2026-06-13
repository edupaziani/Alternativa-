import { Suspense } from 'react'
import Link from 'next/link'
import { serverApi } from '@/lib/api-server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/data-table/DataTable'
import type { ColumnDef } from '@tanstack/react-table'

interface ProfessionalRow {
  id: string
  name: string
  specialty: string | null
  crm: string | null
  attendance_units: { name: string } | null
}

const columns: ColumnDef<ProfessionalRow>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
    cell: ({ row }) => (
      <Link href={`/professionals/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'specialty',
    header: 'Especialidade',
    cell: ({ getValue }) => getValue<string | null>() ?? '—',
  },
  {
    accessorKey: 'crm',
    header: 'CRM',
    cell: ({ getValue }) => {
      const v = getValue<string | null>()
      return v ? <Badge variant="outline">{v}</Badge> : '—'
    },
  },
  {
    id: 'unit',
    header: 'Unidade principal',
    cell: ({ row }) => row.original.attendance_units?.name ?? '—',
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Link href={`/professionals/${row.original.id}/edit`}>
        <Button variant="outline" size="sm">Editar</Button>
      </Link>
    ),
  },
]

export default async function ProfessionalsPage() {
  const res = await serverApi
    .get<{ data: ProfessionalRow[] }>('/professionals')
    .catch(() => ({ data: [] }))

  const professionals = 'data' in res ? res.data : []

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Profissionais</h1>
        <Link href="/professionals/new">
          <Button>Novo profissional</Button>
        </Link>
      </div>
      <Suspense>
        <DataTable columns={columns} data={professionals} emptyMessage="Nenhum profissional cadastrado." />
      </Suspense>
    </div>
  )
}
