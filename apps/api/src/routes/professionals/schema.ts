import { z } from 'zod'

export const CreateProfessionalBodySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  specialty: z.string().nullable().optional(),
  crm: z.string().nullable().optional(),
  profileId: z.string().uuid().nullable().optional(),
  unitId: z.string().uuid().nullable().optional(),
})

export const UpdateProfessionalBodySchema = CreateProfessionalBodySchema.partial()

export const ListProfessionalsQuerySchema = z.object({
  specialty: z.string().optional(),
  unitId: z.string().uuid().optional(),
  search: z.string().optional(),
})

export const ProfessionalParamsSchema = z.object({
  id: z.string().uuid(),
})

const ScheduleSlotSchema = z.object({
  unitId: z.string().uuid('Unidade inválida'),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
}).refine((s) => s.startTime < s.endTime, {
  message: 'Horário de início deve ser anterior ao horário de término',
})

export const SetScheduleBodySchema = z.object({
  slots: z.array(ScheduleSlotSchema),
})

export type CreateProfessionalBody = z.infer<typeof CreateProfessionalBodySchema>
export type UpdateProfessionalBody = z.infer<typeof UpdateProfessionalBodySchema>
export type ListProfessionalsQuery = z.infer<typeof ListProfessionalsQuerySchema>
export type ProfessionalParams = z.infer<typeof ProfessionalParamsSchema>
export type SetScheduleBody = z.infer<typeof SetScheduleBodySchema>
