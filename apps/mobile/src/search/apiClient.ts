import {
  CafeSearchRequestSchema,
  CafeSearchResponseSchema,
  ErrorEnvelopeSchema,
  type CafeSearchRequest,
  type CafeSearchResponse,
  type ErrorCode,
} from '@bean-stalker/contracts';

import { mobileApiConfig } from '../config/api';

const SEARCH_PATH = '/api/v1/cafes/search';

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

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

export async function searchCafes(
  request: CafeSearchRequest,
  signal?: AbortSignal,
): Promise<CafeSearchResponse> {
  const body = CafeSearchRequestSchema.parse(request);
  let response: Response;

  try {
    response = await fetch(`${mobileApiConfig.apiBaseUrl}${SEARCH_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new CafeSearchError('PROVIDER_UNAVAILABLE', 'Cafe search is unavailable.');
  }

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const envelope = ErrorEnvelopeSchema.safeParse(payload);
    if (envelope.success) {
      throw new CafeSearchError(
        envelope.data.error.code,
        'Cafe search could not be completed.',
        envelope.data.error.requestId,
      );
    }
    throw new CafeSearchError('INTERNAL_ERROR', 'Cafe search could not be completed.');
  }

  const parsed = CafeSearchResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new CafeSearchError('PROVIDER_BAD_RESPONSE', 'Cafe search returned invalid data.');
  }
  return parsed.data;
}
