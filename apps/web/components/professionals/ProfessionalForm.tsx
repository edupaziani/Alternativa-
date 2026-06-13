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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ProfessionalFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  specialty: z.string().optional(),
  crm: z.string().optional(),
  unitId: z.string().optional(),
})

type ProfessionalFormValues = z.infer<typeof ProfessionalFormSchema>

interface ProfessionalFormProps {
  professionalId?: string
  defaultValues?: Partial<ProfessionalFormValues>
  units: { id: string; name: string }[]
}

export function ProfessionalForm({ professionalId, defaultValues, units }: ProfessionalFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(ProfessionalFormSchema),
    defaultValues: defaultValues ?? {},
  })

  async function onSubmit(values: ProfessionalFormValues) {
    setServerError(null)
    const payload = {
      name: values.name,
      specialty: values.specialty || null,
      crm: values.crm || null,
      unitId: values.unitId || null,
    }
    try {
      if (professionalId) {
        await api.put(`/professionals/${professionalId}`, payload)
        router.push(`/professionals/${professionalId}`)
      } else {
        const created = await api.post<{ id: string }>('/professionals', payload)
        router.push(`/professionals/${created.id}`)
      }
      router.refresh()
    } catch (err) {
      setServerError((err as { message?: string }).message ?? 'Erro ao salvar profissional.')
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
              <FormLabel>Nome completo *</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Especialidade</FormLabel>
              <FormControl><Input placeholder="Ex: Ortopedia, Neurologia..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="crm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CRM</FormLabel>
              <FormControl><Input placeholder="CRM/SP 123456" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="unitId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidade principal</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma unidade..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">Sem unidade</SelectItem>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
