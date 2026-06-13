import { z } from 'zod'

export const ProfessionalSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid().nullable(),
  unitId: z.string().uuid().nullable(),
  specialty: z.string().nullable(),
  crm: z.string().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Professional = z.infer<typeof ProfessionalSchema>

export const CreateProfessionalSchema = ProfessionalSchema.omit({
  id: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateProfessionalSchema = CreateProfessionalSchema.partial()

export type CreateProfessionalInput = z.infer<typeof CreateProfessionalSchema>
export type UpdateProfessionalInput = z.infer<typeof UpdateProfessionalSchema>
