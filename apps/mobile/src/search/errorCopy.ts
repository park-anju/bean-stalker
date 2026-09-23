import type { ErrorCode } from '@bean-stalker/contracts';

const COPY: Partial<Record<ErrorCode, string>> = {
  PROVIDER_UNAVAILABLE: 'Cafe search is temporarily unavailable. Please try again.',
  PROVIDER_BAD_RESPONSE: 'Cafe search returned something unexpected. Please try again.',
  RATE_LIMITED: "You're searching too quickly. Wait a moment, then retry.",
  PROVIDER_RATE_LIMITED: 'Cafe search is busy right now. Wait a moment, then retry.',
  PROVIDER_AUTH_ERROR: 'Cafe search is temporarily unavailable. Please try again later.',
  PROVIDER_CAPACITY_EXHAUSTED: 'Cafe search is temporarily unavailable. Please try again later.',
  INTERNAL_ERROR: 'Something went wrong running that search. Please try again.',
  VALIDATION_ERROR: 'That location could not be searched. Please try again.',
};

export function describeSearchError(code: ErrorCode): string {
  return COPY[code] ?? 'Cafe search could not be completed. Please try again.';
}
