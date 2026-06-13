import { z } from 'zod'

export const AttendanceUnitSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome é obrigatório'),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type AttendanceUnit = z.infer<typeof AttendanceUnitSchema>

export const CreateAttendanceUnitSchema = AttendanceUnitSchema.omit({
  id: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateAttendanceUnitSchema = CreateAttendanceUnitSchema.partial()

export type CreateAttendanceUnitInput = z.infer<typeof CreateAttendanceUnitSchema>
export type UpdateAttendanceUnitInput = z.infer<typeof UpdateAttendanceUnitSchema>
