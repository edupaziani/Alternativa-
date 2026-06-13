import Link from 'next/link'
import { AttendanceUnitForm } from '@/components/attendance-units/AttendanceUnitForm'

export const metadata = { title: 'Nova unidade — Sistema Alternativa' }

export default function NewAttendanceUnitPage() {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/attendance-units" className="hover:underline">Unidades</Link>
        <span>/</span>
        <span>Nova unidade</span>
      </div>
      <h1 className="text-xl font-semibold">Nova unidade de atendimento</h1>
      <AttendanceUnitForm />
    </div>
  )
}
