import Link from 'next/link'
import { notFound } from 'next/navigation'
import { serverApi } from '@/lib/api-server'
import { PatientForm } from '@/components/patients/PatientForm'

interface PatientDetail {
  id: string
  name: string
  cpf: string | null
  birth_date: string | null
  phone: string | null
  email: string | null
  gender: 'male' | 'female' | 'other' | null
  marital_status: 'single' | 'married' | 'divorced' | 'widowed' | 'other' | null
  active: boolean
  convenio_id: string | null
  cep: string | null
  address_street: string | null
  address_number: string | null
  address_complement: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
}

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [patient, conveniosRes] = await Promise.all([
    serverApi.get<PatientDetail>(`/patients/${id}`).catch(() => null),
    serverApi
      .get<{ data: { id: string; name: string }[] }>('/convenios')
      .catch(() => ({ data: [] })),
  ])

  if (!patient) notFound()

  const convenios = 'data' in conveniosRes ? conveniosRes.data : []

  return (
    <div className="p-6 max-w-3xl space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/patients" className="hover:underline">
          Pacientes
        </Link>
        <span>/</span>
        <Link href={`/patients/${id}`} className="hover:underline">
          {patient.name}
        </Link>
        <span>/</span>
        <span>Editar</span>
      </div>
      <h1 className="text-xl font-semibold">Editar paciente</h1>
      <PatientForm
        patientId={id}
        convenios={convenios}
        defaultValues={{
          name: patient.name,
          cpf: patient.cpf ?? '',
          birthDate: patient.birth_date ?? '',
          phone: patient.phone ?? '',
          email: patient.email ?? '',
          gender: patient.gender ?? '',
          maritalStatus: patient.marital_status ?? '',
          active: patient.active,
          convenioId: patient.convenio_id ?? '',
          cep: patient.cep ?? '',
          addressStreet: patient.address_street ?? '',
          addressNumber: patient.address_number ?? '',
          addressComplement: patient.address_complement ?? '',
          addressNeighborhood: patient.address_neighborhood ?? '',
          addressCity: patient.address_city ?? '',
          addressState: patient.address_state ?? '',
        }}
      />
    </div>
  )
}
