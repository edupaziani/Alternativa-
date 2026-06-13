import { Suspense } from 'react'
import Link from 'next/link'
import { serverApi } from '@/lib/api-server'
import { Button } from '@/components/ui/button'
import { PatientFilters } from '@/components/patients/PatientFilters'
import { PatientsTable } from '@/components/patients/PatientsTable'
import type { PaginatedResponse } from '@alternativa/types'

interface PatientRow {
  id: string
  name: string
  cpf: string | null
  birth_date: string | null
  phone: string | null
  active: boolean
  convenios: { id: string; name: string } | null
}

interface SearchParams {
  page?: string
  search?: string
  letter?: string
  active?: string
  convenioId?: string
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page = Number(params.page ?? 1)

  const [patientsRes, conveniosRes] = await Promise.all([
    serverApi.get<PaginatedResponse<PatientRow>>('/patients', {
      page,
      search: params.search,
      letter: params.letter,
      active: params.active ?? 'true',
      convenioId: params.convenioId,
    }),
    serverApi.get<{ data: { id: string; name: string }[] }>('/convenios'),
  ]).catch(() => [
    { data: [], total: 0, page: 1, pageSize: 20 } as PaginatedResponse<PatientRow>,
    { data: [] },
  ])

  const patients = 'data' in patientsRes ? patientsRes : { data: [], total: 0, page: 1, pageSize: 20 }
  const convenios = 'data' in conveniosRes ? conveniosRes.data : []

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pacientes</h1>
        <Link href="/patients/new">
          <Button>Novo paciente</Button>
        </Link>
      </div>

      <Suspense>
        <PatientFilters convenios={convenios} />
      </Suspense>

      <Suspense>
        <PatientsTable
          data={(patients as PaginatedResponse<PatientRow>).data}
          pagination={{
            page,
            limit: 20,
            total: (patients as PaginatedResponse<PatientRow>).total,
            totalPages: Math.ceil((patients as PaginatedResponse<PatientRow>).total / 20),
          }}
        />
      </Suspense>
    </div>
  )
}
