import { z } from 'zod'

export const ConvenioSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome é obrigatório'),
  code: z.string().nullable(),
  ansCode: z.string().nullable(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Convenio = z.infer<typeof ConvenioSchema>

export const CreateConvenioSchema = ConvenioSchema.omit({
  id: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateConvenioSchema = CreateConvenioSchema.partial()

export type CreateConvenioInput = z.infer<typeof CreateConvenioSchema>
export type UpdateConvenioInput = z.infer<typeof UpdateConvenioSchema>
