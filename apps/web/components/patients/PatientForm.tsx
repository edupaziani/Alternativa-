'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { isValidCpf } from '@alternativa/types'
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

const PatientFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z
    .string()
    .length(11, 'CPF deve ter 11 dígitos')
    .refine(isValidCpf, 'CPF inválido')
    .or(z.literal(''))
    .optional(),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('E-mail inválido').or(z.literal('')).optional(),
  gender: z.enum(['male', 'female', 'other', '']).optional(),
  maritalStatus: z
    .enum(['single', 'married', 'divorced', 'widowed', 'other', ''])
    .optional(),
  convenioId: z.string().optional(),
  active: z.boolean().optional(),
  cep: z.string().optional(),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().max(2).optional(),
})

type PatientFormValues = z.infer<typeof PatientFormSchema>

interface PatientFormProps {
  patientId?: string
  defaultValues?: Partial<PatientFormValues>
  convenios: { id: string; name: string }[]
}

interface ViaCepResponse {
  logradouro?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean
}

export function PatientForm({ patientId, defaultValues, convenios }: PatientFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [cepLoading, setCepLoading] = useState(false)

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(PatientFormSchema),
    defaultValues: { active: true, ...defaultValues },
  })

  async function lookupCep(cep: string) {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data: ViaCepResponse = await res.json()
      if (!data.erro) {
        form.setValue('addressStreet', data.logradouro ?? '')
        form.setValue('addressNeighborhood', data.bairro ?? '')
        form.setValue('addressCity', data.localidade ?? '')
        form.setValue('addressState', data.uf ?? '')
      }
    } finally {
      setCepLoading(false)
    }
  }

  async function onSubmit(values: PatientFormValues) {
    setServerError(null)

    const payload = {
      ...values,
      cpf: values.cpf || null,
      email: values.email || null,
      gender: (values.gender || null) as 'male' | 'female' | 'other' | null,
      maritalStatus: (values.maritalStatus || null) as
        | 'single'
        | 'married'
        | 'divorced'
        | 'widowed'
        | 'other'
        | null,
      convenioId: values.convenioId === 'none' || !values.convenioId ? null : values.convenioId,
    }

    try {
      if (patientId) {
        await api.put(`/patients/${patientId}`, payload)
        router.push(`/patients/${patientId}`)
      } else {
        const created = await api.post<{ id: string }>('/patients', payload)
        router.push(`/patients/${created.id}`)
      }
      router.refresh()
    } catch (err) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'PATIENT_CPF_DUPLICATE') {
        setServerError('Já existe um paciente com este CPF.')
      } else {
        setServerError(e.message ?? 'Erro ao salvar paciente.')
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Nome completo *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input placeholder="00000000000" maxLength={11} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de nascimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
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
                <FormControl>
                  <Input placeholder="(00) 00000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maritalStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado civil</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="single">Solteiro(a)</SelectItem>
                    <SelectItem value="married">Casado(a)</SelectItem>
                    <SelectItem value="divorced">Divorciado(a)</SelectItem>
                    <SelectItem value="widowed">Viúvo(a)</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="convenioId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Convênio</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Particular / sem convênio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Particular</SelectItem>
                    {convenios.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address via CEP */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-700">Endereço</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="cep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00000-000"
                      maxLength={9}
                      {...field}
                      onBlur={(e) => {
                        field.onBlur()
                        lookupCep(e.target.value)
                      }}
                    />
                  </FormControl>
                  {cepLoading && (
                    <p className="text-xs text-slate-500">Buscando endereço...</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressStreet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logradouro</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressComplement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressNeighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="addressState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado (UF)</FormLabel>
                  <FormControl>
                    <Input placeholder="SP" maxLength={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {serverError && (
          <p className="text-sm font-medium text-destructive">{serverError}</p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  )
}
