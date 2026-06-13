'use client'

import Link from 'next/link'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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

export function ProfessionalsTable({ data }: { data: ProfessionalRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyMessage="Nenhum profissional cadastrado."
    />
  )
}
