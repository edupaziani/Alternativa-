import Link from 'next/link'
import { serverApi } from '@/lib/api-server'
import { ProfessionalForm } from '@/components/professionals/ProfessionalForm'

export const metadata = { title: 'Novo profissional — Sistema Alternativa' }

export default async function NewProfessionalPage() {
  const res = await serverApi
    .get<{ data: { id: string; name: string }[] }>('/attendance-units')
    .catch(() => ({ data: [] }))
  const units = 'data' in res ? res.data : []

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/professionals" className="hover:underline">Profissionais</Link>
        <span>/</span>
        <span>Novo profissional</span>
      </div>
      <h1 className="text-xl font-semibold">Novo profissional</h1>
      <ProfessionalForm units={units} />
    </div>
  )
}
