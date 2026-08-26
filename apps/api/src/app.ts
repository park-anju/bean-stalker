import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { healthRoute } from './routes/health.js';

export async function buildApp(webOrigin: string): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: webOrigin });
  await app.register(healthRoute);

  return app;
}
