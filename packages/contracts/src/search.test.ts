import { describe, expect, it } from 'vitest';
import { CAFE_SEARCH_BOUNDS, CafeSearchRequestSchema } from './search.js';

const validCenter = { latitude: 1.3, longitude: 103.8 };

function requestWith(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    center: validCenter,
    radiusMeters: 2000,
    maxResults: 10,
    rankPreference: 'DISTANCE',
    ...overrides,
  };
}

describe('CafeSearchRequestSchema', () => {
  it('accepts a request within the documented search bounds', () => {
    expect(CafeSearchRequestSchema.safeParse(requestWith()).success).toBe(true);
  });

  it('rejects a radius outside the documented 100-5000 meter bound (BR-09)', () => {
    expect(
      CafeSearchRequestSchema.safeParse(
        requestWith({ radiusMeters: CAFE_SEARCH_BOUNDS.radiusMeters.max + 1 }),
      ).success,
    ).toBe(false);
    expect(
      CafeSearchRequestSchema.safeParse(
        requestWith({ radiusMeters: CAFE_SEARCH_BOUNDS.radiusMeters.min - 1 }),
      ).success,
    ).toBe(false);
  });

  it('rejects a result count outside the documented 1-20 bound (BR-09)', () => {
    expect(
      CafeSearchRequestSchema.safeParse(
        requestWith({ maxResults: CAFE_SEARCH_BOUNDS.maxResults.max + 1 }),
      ).success,
    ).toBe(false);
    expect(
      CafeSearchRequestSchema.safeParse(
        requestWith({ maxResults: CAFE_SEARCH_BOUNDS.maxResults.min - 1 }),
      ).success,
    ).toBe(false);
  });

  it('only accepts the documented rank preference values', () => {
    expect(
      CafeSearchRequestSchema.safeParse(requestWith({ rankPreference: 'POPULARITY' })).success,
    ).toBe(true);
    expect(
      CafeSearchRequestSchema.safeParse(requestWith({ rankPreference: 'RELEVANCE' })).success,
    ).toBe(false);
  });

  it('rejects an unrecognized field so a client cannot smuggle a provider credential or extra parameter through the search request', () => {
    expect(CafeSearchRequestSchema.safeParse(requestWith({ apiKey: 'not-allowed' })).success).toBe(
      false,
    );
  });
});
