import Link from 'next/link'
import { serverApi } from '@/lib/api-server'
import { PatientForm } from '@/components/patients/PatientForm'

export const metadata = { title: 'Novo paciente — Sistema Alternativa' }

export default async function NewPatientPage() {
  const conveniosRes = await serverApi
    .get<{ data: { id: string; name: string }[] }>('/convenios')
    .catch(() => ({ data: [] }))

  const convenios = 'data' in conveniosRes ? conveniosRes.data : []

  return (
    <div className="p-6 max-w-3xl space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/patients" className="hover:underline">
          Pacientes
        </Link>
        <span>/</span>
        <span>Novo paciente</span>
      </div>
      <h1 className="text-xl font-semibold">Novo paciente</h1>
      <PatientForm convenios={convenios} />
    </div>
  )
}
