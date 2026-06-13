import { z } from 'zod'

export const ProfessionalScheduleSchema = z.object({
  id: z.string().uuid(),
  professionalId: z.string().uuid(),
  unitId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato inválido (HH:MM)'),
  endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Formato inválido (HH:MM)'),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type ProfessionalSchedule = z.infer<typeof ProfessionalScheduleSchema>

export const CreateProfessionalScheduleSchema = ProfessionalScheduleSchema.omit({
  id: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateProfessionalScheduleSchema = CreateProfessionalScheduleSchema.partial()

export type CreateProfessionalScheduleInput = z.infer<typeof CreateProfessionalScheduleSchema>
export type UpdateProfessionalScheduleInput = z.infer<typeof UpdateProfessionalScheduleSchema>
