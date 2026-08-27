import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import {
  CafeSearchRequestSchema,
  CafeSearchResponseSchema,
  formatValidationError,
} from '@bean-stalker/contracts';
import type { CafeProvider } from '../providers/cafeProvider.js';
import { ProviderError, type ProviderErrorCode } from '../providers/providerError.js';

const PROVIDER_ERROR_STATUS: Record<ProviderErrorCode, number> = {
  PROVIDER_AUTH_ERROR: 502,
  PROVIDER_RATE_LIMITED: 503,
  PROVIDER_UNAVAILABLE: 503,
  PROVIDER_BAD_RESPONSE: 502,
};

export function cafeSearchRoute(provider: CafeProvider): FastifyPluginAsync {
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
