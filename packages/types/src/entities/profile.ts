import { z } from 'zod'
import { UserRole } from '../enums'

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(1, 'Nome é obrigatório'),
  role: z.nativeEnum(UserRole),
  crm: z.string().nullable(),
  phone: z.string().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Profile = z.infer<typeof ProfileSchema>

export const UpdateProfileSchema = ProfileSchema.pick({
  fullName: true,
  crm: true,
  phone: true,
}).partial()

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
