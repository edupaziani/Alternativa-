import { z } from 'zod'

export const PatientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().length(11, 'CPF deve ter 11 dígitos').nullable(),
  birthDate: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().email('E-mail inválido').nullable(),
  convenioId: z.string().uuid().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Patient = z.infer<typeof PatientSchema>

export const CreatePatientSchema = PatientSchema.omit({
  id: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdatePatientSchema = CreatePatientSchema.partial()

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>
