import Link from 'next/link'
import { notFound } from 'next/navigation'
import { serverApi } from '@/lib/api-server'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScheduleEditor } from '@/components/professionals/ScheduleEditor'

interface Professional {
  id: string
  name: string
  specialty: string | null
  crm: string | null
  attendance_units: { id: string; name: string } | null
}

interface ScheduleSlot {
  unit_id: string
  day_of_week: number
  start_time: string
  end_time: string
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value || '—'}</dd>
    </div>
  )
}

export default async function ProfessionalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [professional, scheduleRes, unitsRes] = await Promise.all([
    serverApi.get<Professional>(`/professionals/${id}`).catch(() => null),
    serverApi.get<{ data: ScheduleSlot[] }>(`/professionals/${id}/schedule`).catch(() => ({ data: [] })),
    serverApi.get<{ data: { id: string; name: string }[] }>('/attendance-units').catch(() => ({ data: [] })),
  ])

  if (!professional) notFound()

  const scheduleSlots = ('data' in scheduleRes ? scheduleRes.data : []).map((s) => ({
    unitId: s.unit_id,
    dayOfWeek: s.day_of_week,
    startTime: s.start_time.slice(0, 5),
    endTime: s.end_time.slice(0, 5),
  }))

  const units = 'data' in unitsRes ? unitsRes.data : []

  return (
    <div className="p-6 max-w-3xl space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/professionals" className="hover:underline">Profissionais</Link>
        <span>/</span>
        <span className="text-slate-900">{professional.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{professional.name}</h1>
        <Link href={`/professionals/${id}/edit`}>
          <Button variant="outline">Editar</Button>
        </Link>
      </div>

      <Separator />

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Dados</TabsTrigger>
          <TabsTrigger value="schedule">Agenda</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="pt-4">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
            <Field label="Especialidade" value={professional.specialty} />
            <Field label="CRM" value={professional.crm} />
            <Field label="Unidade principal" value={professional.attendance_units?.name} />
          </dl>
        </TabsContent>

        <TabsContent value="schedule" className="pt-4">
          <ScheduleEditor
            professionalId={id}
            initialSlots={scheduleSlots}
            units={units}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
