import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import {
  CafeSearchRequestSchema,
  CafeSearchResponseSchema,
  formatValidationError,
} from '@bean-stalker/contracts';
import type { CafeProvider } from '../providers/cafeProvider.js';
import { ProviderError, type ProviderErrorCode } from '../providers/providerError.js';
import type { FixedWindowRateLimiter } from '../rateLimiter.js';
import type { ProviderUsageGuard } from '../providerUsageGuard.js';

const PROVIDER_ERROR_STATUS: Record<ProviderErrorCode, number> = {
  PROVIDER_AUTH_ERROR: 502,
  PROVIDER_RATE_LIMITED: 503,
  PROVIDER_UNAVAILABLE: 503,
  PROVIDER_BAD_RESPONSE: 502,
};

export interface CafeSearchRouteDeps {
  provider: CafeProvider;
  /** H04 — global metered-provider usage guard. */
  usageGuard: ProviderUsageGuard;
  /** H03 — per-client rate limiter. Omit to disable per-client limiting. */
  rateLimiter?: FixedWindowRateLimiter;
}

/**
 * `POST /api/v1/cafes/search` pipeline (H03/H04/H05):
 *
 *   schema validation → per-client rate limit → global usage guard → provider
 *
 *   - invalid request        → 400, provider not called, 0 usage consumed
 *   - per-client rate limited → 429 RATE_LIMITED, provider not called, 0 usage
 *   - usage guard denied      → 503 PROVIDER_CAPACITY_EXHAUSTED, provider not called
 *   - allowed                 → +1 usage consumed, provider attempted (usage
 *                               stays consumed even if the provider then fails)
 */
export function cafeSearchRoute(deps: CafeSearchRouteDeps): FastifyPluginAsync {
  const { provider, usageGuard, rateLimiter } = deps;

  return async function registerCafeSearchRoute(app: FastifyInstance) {
    app.post('/cafes/search', async (request, reply) => {
      const parsedRequest = CafeSearchRequestSchema.safeParse(request.body);
      if (!parsedRequest.success) {
        return reply.status(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: formatValidationError('Search request', parsedRequest.error),
            requestId: request.id,
          },
        });
      }

      // Per-client abuse limit. `request.ip` is used only as an ephemeral
      // in-memory key — never logged, never persisted (H03).
      if (rateLimiter) {
        const decision = rateLimiter.tryConsume(request.ip);
        if (!decision.allowed) {
          return reply
            .header('Retry-After', String(decision.retryAfterSeconds))
            .status(429)
            .send({
              error: {
                code: 'RATE_LIMITED',
                message:
                  'You are sending search requests too quickly. Please wait a moment and try again.',
                requestId: request.id,
              },
            });
        }
      }

      // Global metered-provider allowance. Consumes one unit *before* the
      // provider is attempted; not refunded if the provider later fails.
      const usage = await usageGuard.tryConsume();
      if (!usage.allowed) {
        request.log.warn(
          { usagePeriod: usage.periodKey, event: 'provider_capacity_exhausted' },
          'global provider usage allowance exhausted',
        );
        return reply.status(503).send({
          error: {
            code: 'PROVIDER_CAPACITY_EXHAUSTED',
            message: 'Live cafe search is temporarily unavailable. Please try again later.',
            requestId: request.id,
          },
        });
      }

      try {
        const cafes = await provider.searchNearby(parsedRequest.data);
        const response = CafeSearchResponseSchema.parse({
          searchCenter: parsedRequest.data.center,
          fetchedAt: new Date().toISOString(),
          cafes,
        });
        return reply.status(200).send(response);
      } catch (error) {
        if (error instanceof ProviderError) {
          request.log.error({ providerErrorCode: error.code }, 'cafe search provider failure');
          return reply.status(PROVIDER_ERROR_STATUS[error.code]).send({
            error: { code: error.code, message: error.message, requestId: request.id },
          });
        }
        throw error;
      }
    });
  };
}
