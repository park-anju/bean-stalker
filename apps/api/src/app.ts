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
import { registerSecurity, REQUEST_BODY_LIMIT_BYTES, REQUEST_TIMEOUT_MS } from './security.js';

export interface BuildAppOptions {
  /** API CORS allow-origin — a single bare origin (validated in env.ts). */
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
  const app = Fastify({
    logger,
    // H07 — bound the request surface. `trustProxy` is deliberately left at
    // its default (false): `request.ip` is the socket address, which is only
    // meaningful for a direct connection. A deployment behind a reverse proxy
    // must configure the exact trusted hop before that identity is used
    // (BLK-003 / ADR-009).
    bodyLimit: REQUEST_BODY_LIMIT_BYTES,
    requestTimeout: REQUEST_TIMEOUT_MS,
  });

  // Strict single-origin CORS. `@fastify/cors` with a string origin emits that
  // exact value as `Access-Control-Allow-Origin` and never reflects an
  // arbitrary attacker `Origin`. CORS is a browser control, not a boundary
  // against direct HTTP clients (see the Threat Model).
  await app.register(cors, { origin: webOrigin });

  registerSecurity(app);

  // Global safety net so even a body-parse failure or an unexpected thrown
  // error still returns Bean Stalker's stable envelope shape, not Fastify's
  // own default error format. The custom `err` log serializer (see logging.ts)
  // ensures the logged error cannot carry an attached provider payload, and
  // the client message is always a bounded generic string.
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const statusCode = typeof error.statusCode === 'number' ? error.statusCode : 500;

    if (statusCode < 500) {
      // Covers invalid/unparseable bodies and an over-limit body (413). The
      // client never sees the framework message, path, or the limit value.
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
