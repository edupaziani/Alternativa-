import { Suspense } from 'react'
import Link from 'next/link'
import { serverApi } from '@/lib/api-server'
import { Button } from '@/components/ui/button'
import { AttendanceUnitsTable } from '@/components/attendance-units/AttendanceUnitsTable'

interface UnitRow {
  id: string
  name: string
  address: string | null
  phone: string | null
}

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
        <AttendanceUnitsTable data={units} />
      </Suspense>
    </div>
  )
}
