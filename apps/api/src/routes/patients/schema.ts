import { z } from 'zod'
import { isValidCpf } from '@alternativa/types'

const cpfField = z
  .string()
  .length(11, 'CPF deve ter 11 dígitos')
  .refine(isValidCpf, 'CPF inválido')
  .nullable()
  .optional()

export const CreatePatientBodySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: cpfField,
  birthDate: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email('E-mail inválido').nullable().optional(),
  gender: z.enum(['male', 'female', 'other']).nullable().optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'other']).nullable().optional(),
  active: z.boolean().optional(),
  convenioId: z.string().uuid().nullable().optional(),
  cep: z.string().nullable().optional(),
  addressStreet: z.string().nullable().optional(),
  addressNumber: z.string().nullable().optional(),
  addressComplement: z.string().nullable().optional(),
  addressNeighborhood: z.string().nullable().optional(),
  addressCity: z.string().nullable().optional(),
  addressState: z.string().length(2).nullable().optional(),
})

export const UpdatePatientBodySchema = CreatePatientBodySchema.partial()

export const ListPatientsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  letter: z.string().length(1).optional(),
  active: z.enum(['true', 'false']).optional(),
  convenioId: z.string().uuid().optional(),
})

export const PatientParamsSchema = z.object({
  id: z.string().uuid(),
})

export type CreatePatientBody = z.infer<typeof CreatePatientBodySchema>
export type UpdatePatientBody = z.infer<typeof UpdatePatientBodySchema>
export type ListPatientsQuery = z.infer<typeof ListPatientsQuerySchema>
export type PatientParams = z.infer<typeof PatientParamsSchema>
