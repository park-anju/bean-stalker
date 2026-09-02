import Fastify, {
  type FastifyError,
  type FastifyInstance,
  type FastifyServerOptions,
} from 'fastify';
import cors from '@fastify/cors';
import { healthRoute } from './routes/health.js';
import { cafeSearchRoute } from './routes/cafeSearch.js';
import type { CafeProvider } from './providers/cafeProvider.js';
import type { FixedWindowRateLimiter } from './rateLimiter.js';
import { UnlimitedProviderUsageGuard, type ProviderUsageGuard } from './providerUsageGuard.js';
import { buildLoggerOptions } from './logging.js';

export interface BuildAppOptions {
  webOrigin: string;
  cafeProvider: CafeProvider;
  /** H04 — global metered-provider usage guard. Defaults to unlimited. */
  usageGuard?: ProviderUsageGuard;
  /** H03 — per-client rate limiter for the search route. Omit to disable. */
  searchRateLimiter?: FixedWindowRateLimiter;
  /** Overrides the privacy-safe default logger (tests pass a capturing stream). */
  logger?: FastifyServerOptions['logger'];
}

export async function buildApp({
  webOrigin,
  cafeProvider,
  usageGuard = new UnlimitedProviderUsageGuard(),
  searchRateLimiter,
  logger = buildLoggerOptions(),
}: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger });

  await app.register(cors, { origin: webOrigin });

  // Global safety net so even a body-parse failure or an unexpected thrown
  // error still returns Bean Stalker's stable envelope shape, not Fastify's
  // own default error format. The custom `err` log serializer (see logging.ts)
  // ensures the logged error cannot carry an attached provider payload.
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
  await app.register(
    cafeSearchRoute({ provider: cafeProvider, usageGuard, rateLimiter: searchRateLimiter }),
    { prefix: '/api/v1' },
  );

  return app;
}
