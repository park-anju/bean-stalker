import { describe, expect, it } from 'vitest';
import { describeSearchError, isRetryable } from './errorCopy.js';

describe('describeSearchError', () => {
  it('gives distinct, bounded copy for a per-client rate limit vs. global capacity exhaustion', () => {
    const rateLimited = describeSearchError('RATE_LIMITED');
    const capacity = describeSearchError('PROVIDER_CAPACITY_EXHAUSTED');

    expect(rateLimited).toMatch(/too quickly/i);
    expect(capacity).toMatch(/temporarily unavailable/i);
    expect(rateLimited).not.toBe(capacity);
  });

  it('never leaks pricing, counters or infrastructure detail', () => {
    for (const copy of [
      describeSearchError('RATE_LIMITED'),
      describeSearchError('PROVIDER_CAPACITY_EXHAUSTED'),
    ]) {
      expect(copy).not.toMatch(/RM\s?\d|month|budget|quota|limit|counter|Google/i);
    }
  });

  it('falls back to a generic message for an unmapped code', () => {
    expect(describeSearchError('REQUEST_ABORTED')).toMatch(/could not be completed/i);
  });
});

describe('isRetryable', () => {
  it('offers an explicit retry for both rate-limit and capacity errors', () => {
    expect(isRetryable('RATE_LIMITED')).toBe(true);
    expect(isRetryable('PROVIDER_CAPACITY_EXHAUSTED')).toBe(true);
  });

  it('does not offer retry for a validation error', () => {
    expect(isRetryable('VALIDATION_ERROR')).toBe(false);
  });
});
