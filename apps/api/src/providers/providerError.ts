import type { ErrorCode } from '@bean-stalker/contracts';

export type ProviderErrorCode = Extract<
  ErrorCode,
  'PROVIDER_AUTH_ERROR' | 'PROVIDER_RATE_LIMITED' | 'PROVIDER_UNAVAILABLE' | 'PROVIDER_BAD_RESPONSE'
>;

export class ProviderError extends Error {
  constructor(
    public readonly code: ProviderErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}
