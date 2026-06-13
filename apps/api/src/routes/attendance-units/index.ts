import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { UserRole, AppError, ErrorCode } from '@alternativa/types'
import type { TablesUpdate } from '@alternativa/types'

const BodySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
})

const ParamsSchema = z.object({ id: z.string().uuid() })

const attendanceUnitRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { data, error } = await request.supabase
        .from('attendance_units')
        .select('*')
        .is('deleted_at', null)
        .order('name', { ascending: true })

      if (error) throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500)
      return reply.send({ data })
    },
  })

  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: { params: ParamsSchema },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string }
      const { data, error } = await request.supabase
        .from('attendance_units')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error || !data) {
        throw new AppError(ErrorCode.ATTENDANCE_UNIT_NOT_FOUND, 'Unidade não encontrada', 404)
      }
      return reply.send(data)
    },
  })

  fastify.post('/', {
    preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)],
    schema: { body: BodySchema },
    handler: async (request, reply) => {
      const body = request.body as z.infer<typeof BodySchema>
      const { data, error } = await request.supabase
        .from('attendance_units')
        .insert({ name: body.name, address: body.address ?? null, phone: body.phone ?? null })
        .select()
        .single()

      if (error) throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500)
      return reply.status(201).send(data)
    },
  })

  fastify.put('/:id', {
    preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)],
    schema: { params: ParamsSchema, body: BodySchema.partial() },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string }
      const body = request.body as Partial<z.infer<typeof BodySchema>>

      const { data: existing } = await request.supabase
        .from('attendance_units')
        .select('id')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new AppError(ErrorCode.ATTENDANCE_UNIT_NOT_FOUND, 'Unidade não encontrada', 404)
      }

      const update: TablesUpdate<'attendance_units'> = {}
      if (body.name !== undefined)    update.name = body.name
      if (body.address !== undefined) update.address = body.address ?? null
      if (body.phone !== undefined)   update.phone = body.phone ?? null

      const { data, error } = await request.supabase
        .from('attendance_units')
        .update(update)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500)
      return reply.send(data)
    },
  })

  fastify.delete('/:id', {
    preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)],
    schema: { params: ParamsSchema },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string }

      const { data: existing } = await request.supabase
        .from('attendance_units')
        .select('id')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (!existing) {
        throw new AppError(ErrorCode.ATTENDANCE_UNIT_NOT_FOUND, 'Unidade não encontrada', 404)
      }

      const { error } = await request.supabase
        .from('attendance_units')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500)
      return reply.status(204).send()
    },
  })
}

export default attendanceUnitRoutes
