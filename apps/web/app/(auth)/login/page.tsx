import { Suspense } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LoginForm } from './LoginForm'

export const metadata = {
  title: 'Login — Sistema Alternativa',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sistema Alternativa</CardTitle>
          <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
