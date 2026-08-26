import { describe, expect, it } from 'vitest';
import { ErrorCodeSchema, ErrorEnvelopeSchema } from './errors.js';

describe('ErrorCodeSchema', () => {
  it('accepts every code documented in the Error Catalog', () => {
    const documentedCodes = [
      'VALIDATION_ERROR',
      'LOCATION_PERMISSION_DENIED',
      'LOCATION_UNAVAILABLE',
      'PROVIDER_AUTH_ERROR',
      'PROVIDER_RATE_LIMITED',
      'PROVIDER_UNAVAILABLE',
      'PROVIDER_BAD_RESPONSE',
      'REQUEST_ABORTED',
      'INTERNAL_ERROR',
      'FAVORITES_STORAGE_ERROR',
    ];
    for (const code of documentedCodes) {
      expect(ErrorCodeSchema.safeParse(code).success).toBe(true);
    }
  });

  it('rejects a code that is not part of the closed catalog', () => {
    expect(ErrorCodeSchema.safeParse('NOT_A_REAL_CODE').success).toBe(false);
  });
});

describe('ErrorEnvelopeSchema', () => {
  it('accepts the documented envelope shape with an optional requestId', () => {
    expect(
      ErrorEnvelopeSchema.safeParse({
        error: { code: 'PROVIDER_UNAVAILABLE', message: 'Cafe search is temporarily unavailable.' },
      }).success,
    ).toBe(true);
    expect(
      ErrorEnvelopeSchema.safeParse({
        error: {
          code: 'PROVIDER_UNAVAILABLE',
          message: 'Cafe search is temporarily unavailable.',
          requestId: 'req-123',
        },
      }).success,
    ).toBe(true);
  });

  it('rejects an envelope with an extra field, so a stack trace or provider payload cannot ride along undetected (Error Catalog rule)', () => {
    expect(
      ErrorEnvelopeSchema.safeParse({
        error: { code: 'INTERNAL_ERROR', message: 'Unexpected failure.', stack: 'at foo()' },
      }).success,
    ).toBe(false);
  });
});
