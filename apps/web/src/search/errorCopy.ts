import type { ErrorCode } from '@bean-stalker/contracts';

/**
 * User-facing copy for a failed cafe search, keyed by the stable
 * [[Error Catalog]] code. Raw provider/framework messages are never shown; the
 * API's envelope `message` is deliberately not surfaced verbatim so the UI
 * controls tone and wording.
 */
const SEARCH_ERROR_COPY: Partial<Record<ErrorCode, string>> = {
  VALIDATION_ERROR: 'That location could not be searched. Try choosing a different point.',
  // H03/H05: this client is searching too quickly (HTTP 429).
  RATE_LIMITED: "You're searching too quickly. Please wait a moment, then try again.",
  PROVIDER_AUTH_ERROR: 'Cafe search is temporarily unavailable. Please try again later.',
  PROVIDER_RATE_LIMITED: 'Cafe search is busy right now. Wait a moment, then retry.',
  PROVIDER_UNAVAILABLE: 'Cafe search is temporarily unavailable. Please try again.',
  PROVIDER_BAD_RESPONSE: 'Cafe search returned something unexpected. Please try again.',
  // H04/H05: Bean Stalker's configured live-search capacity is used up (HTTP 503).
  PROVIDER_CAPACITY_EXHAUSTED:
    'Live cafe search is temporarily unavailable. Please try again later.',
  INTERNAL_ERROR: 'Something went wrong running that search. Please try again.',
};

export function describeSearchError(code: ErrorCode): string {
  return SEARCH_ERROR_COPY[code] ?? 'Cafe search could not be completed. Please try again.';
}

/**
 * Whether a manual "Retry" action makes sense for this failure. Retries are
 * never automatic (RM0 / [[API Cost Guardrail Runbook]]) — a retry is always an
 * explicit user click that issues exactly one more request.
 */
export function isRetryable(code: ErrorCode): boolean {
  return (
    code === 'RATE_LIMITED' ||
    code === 'PROVIDER_RATE_LIMITED' ||
    code === 'PROVIDER_UNAVAILABLE' ||
    code === 'PROVIDER_BAD_RESPONSE' ||
    code === 'PROVIDER_AUTH_ERROR' ||
    code === 'PROVIDER_CAPACITY_EXHAUSTED' ||
    code === 'INTERNAL_ERROR'
  );
}
