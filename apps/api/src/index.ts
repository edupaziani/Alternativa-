import Fastify from 'fastify';
import type { Patient } from '@alternativa/types';

const fastify = Fastify({ logger: true });

fastify.get('/health', async () => {
  const _sample: Partial<Patient> = { name: 'Test' };
  return { status: 'ok' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
