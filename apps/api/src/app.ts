import Fastify, { type FastifyError, type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { healthRoute } from './routes/health.js';
import { cafeSearchRoute } from './routes/cafeSearch.js';
import type { CafeProvider } from './providers/cafeProvider.js';

export interface BuildAppOptions {
  webOrigin: string;
  cafeProvider: CafeProvider;
}

export async function buildApp({
  webOrigin,
  cafeProvider,
}: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: webOrigin });

  // Global safety net so even a body-parse failure or an unexpected thrown
  // error still returns Bean Stalker's stable envelope shape, not Fastify's
  // own default error format.
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = typeof error.statusCode === 'number' ? error.statusCode : 500;

    if (statusCode < 500) {
      return reply.status(statusCode).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'The request could not be processed.',
          requestId: request.id,
        },
      });
    }

    request.log.error({ err: error }, 'unhandled error');
    return reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
        requestId: request.id,
      },
    });
  });

  await app.register(healthRoute);
  await app.register(cafeSearchRoute(cafeProvider), { prefix: '/api/v1' });

  return app;
}
