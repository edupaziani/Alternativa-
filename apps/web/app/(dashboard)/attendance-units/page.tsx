import { Suspense } from 'react'
import Link from 'next/link'
import { serverApi } from '@/lib/api-server'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/data-table/DataTable'
import type { ColumnDef } from '@tanstack/react-table'

interface UnitRow {
  id: string
  name: string
  address: string | null
  phone: string | null
}

const columns: ColumnDef<UnitRow>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    accessorKey: 'address',
    header: 'Endereço',
    cell: ({ getValue }) => getValue<string | null>() ?? '—',
  },
  {
    accessorKey: 'phone',
    header: 'Telefone',
    cell: ({ getValue }) => getValue<string | null>() ?? '—',
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Link href={`/attendance-units/${row.original.id}/edit`}>
        <Button variant="outline" size="sm">Editar</Button>
      </Link>
    ),
  },
]

export default async function AttendanceUnitsPage() {
  const res = await serverApi
    .get<{ data: UnitRow[] }>('/attendance-units')
    .catch(() => ({ data: [] }))

  const units = 'data' in res ? res.data : []

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Unidades de atendimento</h1>
        <Link href="/attendance-units/new">
          <Button>Nova unidade</Button>
        </Link>
      </div>
      <Suspense>
        <DataTable columns={columns} data={units} emptyMessage="Nenhuma unidade cadastrada." />
      </Suspense>
    </div>
  )
}
