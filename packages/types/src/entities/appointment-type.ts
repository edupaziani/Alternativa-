import { z } from 'zod'

export const AppointmentTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome é obrigatório'),
  durationMinutes: z.number().int().positive(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type AppointmentType = z.infer<typeof AppointmentTypeSchema>

export const CreateAppointmentTypeSchema = AppointmentTypeSchema.omit({
  id: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateAppointmentTypeSchema = CreateAppointmentTypeSchema.partial()

export type CreateAppointmentTypeInput = z.infer<typeof CreateAppointmentTypeSchema>
export type UpdateAppointmentTypeInput = z.infer<typeof UpdateAppointmentTypeSchema>
