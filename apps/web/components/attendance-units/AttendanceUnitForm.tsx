'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const UnitFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  address: z.string().optional(),
  phone: z.string().optional(),
})

type UnitFormValues = z.infer<typeof UnitFormSchema>

interface AttendanceUnitFormProps {
  unitId?: string
  defaultValues?: Partial<UnitFormValues>
}

export function AttendanceUnitForm({ unitId, defaultValues }: AttendanceUnitFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(UnitFormSchema),
    defaultValues: defaultValues ?? {},
  })

  async function onSubmit(values: UnitFormValues) {
    setServerError(null)
    const payload = {
      name: values.name,
      address: values.address || null,
      phone: values.phone || null,
    }
    try {
      if (unitId) {
        await api.put(`/attendance-units/${unitId}`, payload)
      } else {
        await api.post('/attendance-units', payload)
      }
      router.push('/attendance-units')
      router.refresh()
    } catch (err) {
      setServerError((err as { message?: string }).message ?? 'Erro ao salvar unidade.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da unidade *</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl><Input placeholder="Rua, número, bairro, cidade" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl><Input placeholder="(00) 0000-0000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && <p className="text-sm font-medium text-destructive">{serverError}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </Form>
  )
}
