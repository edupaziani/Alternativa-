import { Suspense } from 'react'
import Link from 'next/link'
import { serverApi } from '@/lib/api-server'
import { Button } from '@/components/ui/button'
import { ProfessionalsTable } from '@/components/professionals/ProfessionalsTable'

interface ProfessionalRow {
  id: string
  name: string
  specialty: string | null
  crm: string | null
  attendance_units: { name: string } | null
}

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
        <ProfessionalsTable data={professionals} />
      </Suspense>
    </div>
  )
}
