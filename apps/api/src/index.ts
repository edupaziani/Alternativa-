import 'dotenv/config'
import Fastify from 'fastify'
import supabasePlugin from './plugins/supabase'
import authPlugin from './plugins/auth'
import errorsPlugin from './plugins/errors'
import patientRoutes from './routes/patients'
import convenioRoutes from './routes/convenios'
import professionalRoutes from './routes/professionals'
import attendanceUnitRoutes from './routes/attendance-units'

const fastify = Fastify({ logger: true })

fastify.register(supabasePlugin)
fastify.register(authPlugin)
fastify.register(errorsPlugin)

fastify.get('/health', async () => ({ status: 'ok' }))

fastify.register(patientRoutes, { prefix: '/patients' })
fastify.register(convenioRoutes, { prefix: '/convenios' })
fastify.register(professionalRoutes, { prefix: '/professionals' })
fastify.register(attendanceUnitRoutes, { prefix: '/attendance-units' })

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3001
    await fastify.listen({ port, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
