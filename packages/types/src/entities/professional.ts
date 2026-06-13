import { z } from 'zod'

export const ProfessionalSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome é obrigatório'),
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

// Schedule slot — a professional's availability in a given unit on a given day
export const ScheduleSlotSchema = z.object({
  id: z.string().uuid().optional(),
  unitId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
})

export type ScheduleSlot = z.infer<typeof ScheduleSlotSchema>

export const SetScheduleSchema = z.object({
  slots: z.array(ScheduleSlotSchema),
})

export type SetScheduleInput = z.infer<typeof SetScheduleSchema>
