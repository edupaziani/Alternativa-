import type { FastifyPluginAsync } from 'fastify'
import { UserRole } from '@alternativa/types'
import {
  CreatePatientBodySchema,
  UpdatePatientBodySchema,
  ListPatientsQuerySchema,
  PatientParamsSchema,
} from './schema'
import {
  listPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
} from './handlers'

const patientRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: { querystring: ListPatientsQuerySchema },
    handler: listPatients,
  })

  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: { params: PatientParamsSchema },
    handler: getPatient,
  })

  fastify.post('/', {
    preHandler: [
      fastify.authenticate,
      fastify.requireRole(UserRole.ADMIN, UserRole.RECEPTIONIST),
    ],
    schema: { body: CreatePatientBodySchema },
    handler: createPatient,
  })

  fastify.put('/:id', {
    preHandler: [
      fastify.authenticate,
      fastify.requireRole(UserRole.ADMIN, UserRole.RECEPTIONIST),
    ],
    schema: { params: PatientParamsSchema, body: UpdatePatientBodySchema },
    handler: updatePatient,
  })

  fastify.delete('/:id', {
    preHandler: [
      fastify.authenticate,
      fastify.requireRole(UserRole.ADMIN, UserRole.RECEPTIONIST),
    ],
    schema: { params: PatientParamsSchema },
    handler: deletePatient,
  })
}

export default patientRoutes
