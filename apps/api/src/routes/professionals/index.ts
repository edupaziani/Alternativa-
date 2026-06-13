import type { FastifyPluginAsync } from 'fastify'
import { UserRole } from '@alternativa/types'
import {
  CreateProfessionalBodySchema,
  UpdateProfessionalBodySchema,
  ListProfessionalsQuerySchema,
  ProfessionalParamsSchema,
  SetScheduleBodySchema,
} from './schema'
import {
  listProfessionals,
  getProfessional,
  createProfessional,
  updateProfessional,
  deleteProfessional,
  getSchedule,
  setSchedule,
} from './handlers'

const professionalRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: { querystring: ListProfessionalsQuerySchema },
    handler: listProfessionals,
  })

  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: { params: ProfessionalParamsSchema },
    handler: getProfessional,
  })

  fastify.post('/', {
    preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)],
    schema: { body: CreateProfessionalBodySchema },
    handler: createProfessional,
  })

  fastify.put('/:id', {
    preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)],
    schema: { params: ProfessionalParamsSchema, body: UpdateProfessionalBodySchema },
    handler: updateProfessional,
  })

  fastify.delete('/:id', {
    preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)],
    schema: { params: ProfessionalParamsSchema },
    handler: deleteProfessional,
  })

  fastify.get('/:id/schedule', {
    preHandler: [fastify.authenticate],
    schema: { params: ProfessionalParamsSchema },
    handler: getSchedule,
  })

  fastify.put('/:id/schedule', {
    preHandler: [fastify.authenticate, fastify.requireRole(UserRole.ADMIN)],
    schema: { params: ProfessionalParamsSchema, body: SetScheduleBodySchema },
    handler: setSchedule,
  })
}

export default professionalRoutes
