import Link from 'next/link'
import { notFound } from 'next/navigation'
import { serverApi } from '@/lib/api-server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCPF, formatPhone, formatDate, formatCEP } from '@/lib/utils'

interface PatientDetail {
  id: string
  name: string
  cpf: string | null
  birth_date: string | null
  phone: string | null
  email: string | null
  gender: string | null
  marital_status: string | null
  active: boolean
  cep: string | null
  address_street: string | null
  address_number: string | null
  address_complement: string | null
  address_neighborhood: string | null
  address_city: string | null
  address_state: string | null
  convenios: { name: string } | null
  created_at: string
}

const GENDER_LABELS: Record<string, string> = {
  male: 'Masculino',
  female: 'Feminino',
  other: 'Outro',
}

const MARITAL_LABELS: Record<string, string> = {
  single: 'Solteiro(a)',
  married: 'Casado(a)',
  divorced: 'Divorciado(a)',
  widowed: 'Viúvo(a)',
  other: 'Outro',
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm text-slate-900">{value || '—'}</dd>
    </div>
  )
}

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const patient = await serverApi
    .get<PatientDetail>(`/patients/${id}`)
    .catch(() => null)

  if (!patient) notFound()

  const address = [
    patient.address_street,
    patient.address_number,
    patient.address_complement,
    patient.address_neighborhood,
    patient.address_city,
    patient.address_state,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="p-6 max-w-3xl space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/patients" className="hover:underline">
          Pacientes
        </Link>
        <span>/</span>
        <span className="text-slate-900">{patient.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">{patient.name}</h1>
          <Badge variant={patient.active ? 'default' : 'secondary'}>
            {patient.active ? 'Ativo' : 'Desativado'}
          </Badge>
        </div>
        <Link href={`/patients/${patient.id}/edit`}>
          <Button variant="outline">Editar</Button>
        </Link>
      </div>

      <Separator />

      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
        <Field label="CPF" value={patient.cpf ? formatCPF(patient.cpf) : null} />
        <Field
          label="Nascimento"
          value={patient.birth_date ? formatDate(patient.birth_date) : null}
        />
        <Field label="Telefone" value={patient.phone ? formatPhone(patient.phone) : null} />
        <Field label="E-mail" value={patient.email} />
        <Field label="Sexo" value={patient.gender ? GENDER_LABELS[patient.gender] : null} />
        <Field
          label="Estado civil"
          value={patient.marital_status ? MARITAL_LABELS[patient.marital_status] : null}
        />
        <Field label="Convênio" value={patient.convenios?.name ?? 'Particular'} />
      </dl>

      <Separator />

      <div>
        <h2 className="text-sm font-medium text-slate-700 mb-3">Endereço</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
          <Field label="CEP" value={patient.cep ? formatCEP(patient.cep) : null} />
          <Field label="Endereço" value={address || null} />
        </dl>
      </div>
    </div>
  )
}
