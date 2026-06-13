import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import { AppError, ErrorCode } from '@alternativa/types'

const errorsPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error, requestId: request.id }, 'Request error')

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send(error.toJSON())
    }

    // Fastify validation error
    if (error.validation) {
      const appError = new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Dados da requisição inválidos',
        400,
      )
      return reply.status(400).send(appError.toJSON())
    }

    const internal = new AppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Erro interno do servidor',
      500,
    )
    return reply.status(500).send(internal.toJSON())
  })
}

export default fp(errorsPlugin, { name: 'errors' })
