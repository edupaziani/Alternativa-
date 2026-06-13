import fp from 'fastify-plugin'
import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@alternativa/types'
import { UserRole } from '@alternativa/types'
import { createUserClient } from '../lib/supabase'
import { AppError, ErrorCode } from '@alternativa/types'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    requireRole: (
      ...roles: UserRole[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
  interface FastifyRequest {
    user: { id: string; email: string; role: UserRole }
    supabase: SupabaseClient<Database>
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authHeader = request.headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        const err = new AppError(ErrorCode.UNAUTHORIZED, 'Token de autenticação não fornecido', 401)
        return reply.status(401).send(err.toJSON())
      }

      const token = authHeader.slice(7)
      const supabase = createUserClient(token)

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        const err = new AppError(ErrorCode.UNAUTHORIZED, 'Token inválido ou expirado', 401)
        return reply.status(401).send(err.toJSON())
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .is('deleted_at', null)
        .single()

      request.user = {
        id: user.id,
        email: user.email!,
        role: (profile?.role ?? UserRole.RECEPTIONIST) as UserRole,
      }
      request.supabase = supabase
    },
  )

  fastify.decorate(
    'requireRole',
    (...roles: UserRole[]) =>
      async (request: FastifyRequest, reply: FastifyReply) => {
        if (!roles.includes(request.user.role)) {
          const err = new AppError(
            ErrorCode.FORBIDDEN,
            'Acesso negado para este perfil',
            403,
          )
          return reply.status(403).send(err.toJSON())
        }
      },
  )
}

export default fp(authPlugin, { name: 'auth', dependencies: ['supabase'] })
