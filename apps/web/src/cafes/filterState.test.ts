import { describe, expect, it } from 'vitest';
import type { Cafe } from '@bean-stalker/contracts';
import {
  DEFAULT_DISCOVERY_FILTERS,
  applyDiscoveryFilters,
  isDefaultFilters,
} from './filterState.js';

function cafe(overrides: Partial<Cafe> & Pick<Cafe, 'placeId'>): Cafe {
  return {
    name: overrides.placeId,
    location: { latitude: 1.55, longitude: 110.36 },
    openStatus: 'UNKNOWN',
    distanceMeters: 500,
    ...overrides,
  };
}

// rating 4.8 / 50 reviews / 100 m
const A = cafe({
  placeId: 'A',
  rating: 4.8,
  userRatingCount: 50,
  distanceMeters: 100,
  openStatus: 'OPEN',
});
// rating 4.8 / 500 reviews / 900 m
const B = cafe({
  placeId: 'B',
  rating: 4.8,
  userRatingCount: 500,
  distanceMeters: 900,
  openStatus: 'CLOSED',
});
// rating 4.8 / 500 reviews / 300 m
const C = cafe({
  placeId: 'C',
  rating: 4.8,
  userRatingCount: 500,
  distanceMeters: 300,
  openStatus: 'OPEN',
});
// no rating
const D = cafe({ placeId: 'D', distanceMeters: 50, openStatus: 'UNKNOWN' });
// rating 4.1
const E = cafe({
  placeId: 'E',
  rating: 4.1,
  userRatingCount: 12,
  distanceMeters: 700,
  openStatus: 'CLOSED',
});

const ALL: Cafe[] = [A, B, C, D, E];

describe('applyDiscoveryFilters — defaults', () => {
  it('with defaults, hides nothing and orders by distance ascending', () => {
    const result = applyDiscoveryFilters(ALL, DEFAULT_DISCOVERY_FILTERS);
    expect(result.map((cafeItem) => cafeItem.placeId)).toEqual(['D', 'A', 'C', 'E', 'B']);
  });

  it('does not mutate the input array', () => {
    const input = [...ALL];
    applyDiscoveryFilters(input, { minRating: 4, openNowOnly: true, sortBy: 'RATING' });
    expect(input).toEqual(ALL);
  });
});

describe('applyDiscoveryFilters — minimum rating', () => {
  it('a positive threshold excludes both lower-rated and unrated cafes', () => {
    const result = applyDiscoveryFilters(ALL, { ...DEFAULT_DISCOVERY_FILTERS, minRating: 4.5 });
    expect(result.map((c) => c.placeId).sort()).toEqual(['A', 'B', 'C']); // E (4.1) and D (unrated) gone
  });

  it('a zero threshold keeps unrated cafes', () => {
    const result = applyDiscoveryFilters(ALL, { ...DEFAULT_DISCOVERY_FILTERS, minRating: 0 });
    expect(result.map((c) => c.placeId)).toContain('D');
  });
});

describe('applyDiscoveryFilters — Open Now', () => {
  it('keeps only OPEN cafes; CLOSED and UNKNOWN are both excluded', () => {
    const result = applyDiscoveryFilters(ALL, { ...DEFAULT_DISCOVERY_FILTERS, openNowOnly: true });
    expect(result.map((c) => c.placeId).sort()).toEqual(['A', 'C']);
  });
});

describe('applyDiscoveryFilters — combined (intersection, not union)', () => {
  it('rating >= 4.5 AND Open Now leaves only cafes satisfying both', () => {
    const result = applyDiscoveryFilters(ALL, {
      minRating: 4.5,
      openNowOnly: true,
      sortBy: 'DISTANCE',
    });
    expect(result.map((c) => c.placeId)).toEqual(['A', 'C']); // B is 4.8 but CLOSED; E is OPEN? no, CLOSED and 4.1
  });
});

describe('applyDiscoveryFilters — rating sort / OQ-008 tie-break', () => {
  it('rating DESC, then userRatingCount DESC, then distance ASC, unrated last', () => {
    const result = applyDiscoveryFilters(ALL, { ...DEFAULT_DISCOVERY_FILTERS, sortBy: 'RATING' });
    // A/B/C all 4.8: B & C have 500 reviews (C closer → first), A has 50 → after them.
    // E 4.1 next. D unrated last.
    expect(result.map((c) => c.placeId)).toEqual(['C', 'B', 'A', 'E', 'D']);
  });
});

describe('applyDiscoveryFilters — filter then sort', () => {
  it('sorts only the cafes that survived filtering', () => {
    const result = applyDiscoveryFilters(ALL, {
      minRating: 4.5,
      openNowOnly: false,
      sortBy: 'RATING',
    });
    expect(result.map((c) => c.placeId)).toEqual(['C', 'B', 'A']);
  });
});

describe('isDefaultFilters', () => {
  it('is true only for the exact default triple', () => {
    expect(isDefaultFilters(DEFAULT_DISCOVERY_FILTERS)).toBe(true);
    expect(isDefaultFilters({ ...DEFAULT_DISCOVERY_FILTERS, openNowOnly: true })).toBe(false);
    expect(isDefaultFilters({ ...DEFAULT_DISCOVERY_FILTERS, minRating: 4 })).toBe(false);
    expect(isDefaultFilters({ ...DEFAULT_DISCOVERY_FILTERS, sortBy: 'RATING' })).toBe(false);
  });
});
