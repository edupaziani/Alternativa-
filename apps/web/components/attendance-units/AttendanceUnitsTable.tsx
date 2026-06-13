'use client'

import Link from 'next/link'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/DataTable'
import { Button } from '@/components/ui/button'

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
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
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

export function AttendanceUnitsTable({ data }: { data: UnitRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="Nenhuma unidade cadastrada."
    />
  )
}
