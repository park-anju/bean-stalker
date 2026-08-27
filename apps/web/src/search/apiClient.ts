import {
  CafeSearchRequestSchema,
  CafeSearchResponseSchema,
  ErrorEnvelopeSchema,
  type CafeSearchRequest,
  type CafeSearchResponse,
  type ErrorCode,
} from '@bean-stalker/contracts';
import { clientEnv } from '../env.js';

/**
 * A cafe-search failure the UI can present without leaking transport detail.
 * `code` is a Bean Stalker `ErrorCode` (from the API's stable envelope, or a
 * client-side classification for network/parse failures); the raw Response,
 * Google payloads and Fastify stack traces never reach this object.
 */
export class CafeSearchError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = 'CafeSearchError';
  }
}

const SEARCH_PATH = '/api/v1/cafes/search';

/**
 * The single browser→API boundary for cafe search. React never calls Google
 * Places directly ([[ADR-005 Server-Side Places Proxy]]); it calls this, which
 * calls Fastify, which calls Google with the server-only credential.
 *
 * - validates the outbound body with the shared contract before sending;
 * - forwards the TanStack Query `AbortSignal` so a superseded search is
 *   cancelled in the browser;
 * - runtime-validates the response (success and error envelopes) with the
 *   shared Zod schemas — TypeScript casts are not trusted at this boundary.
 */
export async function searchCafes(
  request: CafeSearchRequest,
  signal?: AbortSignal,
): Promise<CafeSearchResponse> {
  const body = CafeSearchRequestSchema.parse(request);

  let response: Response;
  try {
    response = await fetch(`${clientEnv.apiBaseUrl}${SEARCH_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    // An aborted fetch is a superseded/cancelled search, not a real failure —
    // let TanStack Query see the native AbortError rather than a scary toast.
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new CafeSearchError(
      'PROVIDER_UNAVAILABLE',
      'Could not reach cafe search. Check your connection and try again.',
    );
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const envelope = ErrorEnvelopeSchema.safeParse(payload);
    if (envelope.success) {
      throw new CafeSearchError(
        envelope.data.error.code,
        envelope.data.error.message,
        envelope.data.error.requestId,
      );
    }
    throw new CafeSearchError('INTERNAL_ERROR', 'Cafe search failed unexpectedly.');
  }

  const parsed = CafeSearchResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new CafeSearchError(
      'PROVIDER_BAD_RESPONSE',
      'Cafe search returned an unexpected response.',
    );
  }
  return parsed.data;
}
