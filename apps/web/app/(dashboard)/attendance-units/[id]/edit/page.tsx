import Link from 'next/link'
import { notFound } from 'next/navigation'
import { serverApi } from '@/lib/api-server'
import { AttendanceUnitForm } from '@/components/attendance-units/AttendanceUnitForm'

interface Unit {
  id: string
  name: string
  address: string | null
  phone: string | null
}

export default async function EditAttendanceUnitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const unit = await serverApi.get<Unit>(`/attendance-units/${id}`).catch(() => null)
  if (!unit) notFound()

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/attendance-units" className="hover:underline">Unidades</Link>
        <span>/</span>
        <span>Editar</span>
      </div>
      <h1 className="text-xl font-semibold">Editar unidade — {unit.name}</h1>
      <AttendanceUnitForm
        unitId={id}
        defaultValues={{
          name: unit.name,
          address: unit.address ?? '',
          phone: unit.phone ?? '',
        }}
      />
    </div>
  )
}
