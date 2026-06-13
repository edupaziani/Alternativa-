import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-56 shrink-0 border-r bg-white">
        <div className="flex h-14 items-center border-b px-4">
          <span className="font-semibold text-sm">Sistema Alternativa</span>
        </div>
        <nav className="p-3 space-y-1">
          <Link
            href="/patients"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100"
          >
            Pacientes
          </Link>
          <Link
            href="/professionals"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100"
          >
            Profissionais
          </Link>
          <Link
            href="/attendance-units"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-100"
          >
            Unidades
          </Link>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
