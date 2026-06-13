import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import { supabaseAdmin } from '../lib/supabase'

declare module 'fastify' {
  interface FastifyInstance {
    // Service-role client — available for admin/migration scripts only.
    // Route handlers must use request.supabase (user-scoped, RLS-respecting).
    supabaseAdmin: typeof supabaseAdmin
  }
}

const supabasePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('supabaseAdmin', supabaseAdmin)
}

export default fp(supabasePlugin, { name: 'supabase' })
