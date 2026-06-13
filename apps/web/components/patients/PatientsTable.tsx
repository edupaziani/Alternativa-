'use client'

import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/data-table/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCPF, formatDate } from '@/lib/utils'

interface PatientRow {
  id: string
  name: string
  cpf: string | null
  birth_date: string | null
  phone: string | null
  active: boolean
  convenios: { name: string } | null
}

interface PatientsTableProps {
  data: PatientRow[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const columns: ColumnDef<PatientRow>[] = [
  {
    accessorKey: 'name',
    header: 'Nome',
    cell: ({ row }) => (
      <Link
        href={`/patients/${row.original.id}`}
        className="font-medium hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'cpf',
    header: 'CPF',
    cell: ({ getValue }) => {
      const v = getValue<string | null>()
      return v ? formatCPF(v) : '—'
    },
  },
  {
    accessorKey: 'birth_date',
    header: 'Nascimento',
    cell: ({ getValue }) => {
      const v = getValue<string | null>()
      return v ? formatDate(v) : '—'
    },
  },
  {
    accessorKey: 'phone',
    header: 'Telefone',
    cell: ({ getValue }) => getValue<string | null>() ?? '—',
  },
  {
    id: 'convenio',
    header: 'Convênio',
    cell: ({ row }) => row.original.convenios?.name ?? '—',
  },
  {
    accessorKey: 'active',
    header: 'Status',
    cell: ({ getValue }) =>
      getValue<boolean>() ? (
        <Badge variant="default">Ativo</Badge>
      ) : (
        <Badge variant="secondary">Desativado</Badge>
      ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Link href={`/patients/${row.original.id}/edit`}>
        <Button variant="outline" size="sm">
          Editar
        </Button>
      </Link>
    ),
  },
]

export function PatientsTable({ data, pagination }: PatientsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-3">
      <DataTable columns={columns} data={data} emptyMessage="Nenhum paciente encontrado." />

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          {pagination.total} paciente{pagination.total !== 1 ? 's' : ''} no total
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => goToPage(pagination.page - 1)}
          >
            Anterior
          </Button>
          <span>
            {pagination.page} / {pagination.totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => goToPage(pagination.page + 1)}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  )
}
