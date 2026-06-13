import Link from 'next/link'
import { notFound } from 'next/navigation'
import { serverApi } from '@/lib/api-server'
import { ProfessionalForm } from '@/components/professionals/ProfessionalForm'

interface Professional {
  id: string
  name: string
  specialty: string | null
  crm: string | null
  unit_id: string | null
}

export default async function EditProfessionalPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [professional, unitsRes] = await Promise.all([
    serverApi.get<Professional>(`/professionals/${id}`).catch(() => null),
    serverApi.get<{ data: { id: string; name: string }[] }>('/attendance-units').catch(() => ({ data: [] })),
  ])

  if (!professional) notFound()

  const units = 'data' in unitsRes ? unitsRes.data : []

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/professionals" className="hover:underline">Profissionais</Link>
        <span>/</span>
        <Link href={`/professionals/${id}`} className="hover:underline">{professional.name}</Link>
        <span>/</span>
        <span>Editar</span>
      </div>
      <h1 className="text-xl font-semibold">Editar profissional</h1>
      <ProfessionalForm
        professionalId={id}
        units={units}
        defaultValues={{
          name: professional.name,
          specialty: professional.specialty ?? '',
          crm: professional.crm ?? '',
          unitId: professional.unit_id ?? '',
        }}
      />
    </div>
  )
}
