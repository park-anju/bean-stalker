import { describe, expect, it } from 'vitest';
import { sortCafes } from './sort.js';
import type { Cafe } from '@bean-stalker/contracts';

function cafe(overrides: Partial<Cafe> & Pick<Cafe, 'placeId'>): Cafe {
  return {
    name: 'Sample Cafe',
    location: { latitude: 1.55, longitude: 110.36 },
    openStatus: 'UNKNOWN',
    distanceMeters: 0,
    ...overrides,
  };
}

describe('sortCafes — DISTANCE mode', () => {
  it('orders ascending by distanceMeters', () => {
    const cafes = [
      cafe({ placeId: 'far', distanceMeters: 900 }),
      cafe({ placeId: 'near', distanceMeters: 100 }),
      cafe({ placeId: 'mid', distanceMeters: 500 }),
    ];
    expect(sortCafes(cafes, 'DISTANCE').map((c) => c.placeId)).toEqual(['near', 'mid', 'far']);
  });

  it('does not mutate the input array', () => {
    const cafes = [
      cafe({ placeId: 'b', distanceMeters: 2 }),
      cafe({ placeId: 'a', distanceMeters: 1 }),
    ];
    const original = [...cafes];
    sortCafes(cafes, 'DISTANCE');
    expect(cafes).toEqual(original);
  });

  it('handles empty and single-item arrays', () => {
    expect(sortCafes([], 'DISTANCE')).toEqual([]);
    const single = [cafe({ placeId: 'only', distanceMeters: 10 })];
    expect(sortCafes(single, 'DISTANCE')).toEqual(single);
  });
});

describe('sortCafes — RATING mode', () => {
  it('orders descending by rating', () => {
    const cafes = [
      cafe({ placeId: 'low', rating: 3.0, distanceMeters: 0 }),
      cafe({ placeId: 'high', rating: 4.8, distanceMeters: 0 }),
      cafe({ placeId: 'mid', rating: 4.0, distanceMeters: 0 }),
    ];
    expect(sortCafes(cafes, 'RATING').map((c) => c.placeId)).toEqual(['high', 'mid', 'low']);
  });

  it('places cafes with a missing rating after all rated cafes', () => {
    const cafes = [
      cafe({ placeId: 'unrated', distanceMeters: 0 }),
      cafe({ placeId: 'rated', rating: 3.5, distanceMeters: 0 }),
    ];
    expect(sortCafes(cafes, 'RATING').map((c) => c.placeId)).toEqual(['rated', 'unrated']);
  });

  it('breaks a rating tie using higher userRatingCount, then closer distance', () => {
    const cafes = [
      cafe({ placeId: 'few-reviews', rating: 4.5, userRatingCount: 10, distanceMeters: 100 }),
      cafe({ placeId: 'many-reviews', rating: 4.5, userRatingCount: 500, distanceMeters: 200 }),
      cafe({
        placeId: 'same-reviews-farther',
        rating: 4.5,
        userRatingCount: 10,
        distanceMeters: 300,
      }),
    ];
    expect(sortCafes(cafes, 'RATING').map((c) => c.placeId)).toEqual([
      'many-reviews',
      'few-reviews',
      'same-reviews-farther',
    ]);
  });

  it('is stable when both cafes have no rating, preserving input order', () => {
    const cafes = [cafe({ placeId: 'first' }), cafe({ placeId: 'second' })];
    expect(sortCafes(cafes, 'RATING').map((c) => c.placeId)).toEqual(['first', 'second']);
  });

  it('does not mutate the input array', () => {
    const cafes = [cafe({ placeId: 'a', rating: 3 }), cafe({ placeId: 'b', rating: 5 })];
    const original = [...cafes];
    sortCafes(cafes, 'RATING');
    expect(cafes).toEqual(original);
  });
});
