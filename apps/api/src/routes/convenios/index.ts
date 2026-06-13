import type { FastifyPluginAsync } from 'fastify'
import { AppError, ErrorCode } from '@alternativa/types'

const convenioRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const { data, error } = await request.supabase
        .from('convenios')
        .select('id, name')
        .is('deleted_at', null)
        .order('name', { ascending: true })

      if (error) {
        throw new AppError(ErrorCode.INTERNAL_SERVER_ERROR, error.message, 500)
      }

      return reply.send({ data })
    },
  })
}

export default convenioRoutes
