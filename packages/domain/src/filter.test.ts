import { describe, expect, it } from 'vitest';
import { filterCafes } from './filter.js';
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

const rated4 = cafe({ placeId: 'rated-4', rating: 4.0 });
const rated2 = cafe({ placeId: 'rated-2', rating: 2.0 });
const unrated = cafe({ placeId: 'unrated' });
const open = cafe({ placeId: 'open', openStatus: 'OPEN', rating: 4.5 });
const closed = cafe({ placeId: 'closed', openStatus: 'CLOSED', rating: 4.5 });
const unknownHours = cafe({ placeId: 'unknown-hours', openStatus: 'UNKNOWN', rating: 4.5 });

describe('filterCafes — no filter', () => {
  it('returns every cafe unchanged when criteria is empty', () => {
    const cafes = [rated4, rated2, unrated];
    expect(filterCafes(cafes, {})).toEqual(cafes);
  });

  it('does not mutate the input array', () => {
    const cafes = [rated4, rated2];
    const original = [...cafes];
    filterCafes(cafes, { minRating: 3 });
    expect(cafes).toEqual(original);
  });
});

describe('filterCafes — minRating', () => {
  it('excludes cafes below the threshold and cafes with no rating at all', () => {
    const result = filterCafes([rated4, rated2, unrated], { minRating: 3 });
    expect(result.map((c) => c.placeId)).toEqual(['rated-4']);
  });

  it('includes a cafe exactly at the boundary', () => {
    const result = filterCafes([rated4], { minRating: 4.0 });
    expect(result.map((c) => c.placeId)).toEqual(['rated-4']);
  });

  it('a zero minimum does not exclude unrated cafes', () => {
    const result = filterCafes([rated4, unrated], { minRating: 0 });
    expect(result.map((c) => c.placeId)).toEqual(['rated-4', 'unrated']);
  });

  it('returns zero matches when the threshold excludes everything', () => {
    expect(filterCafes([rated2, unrated], { minRating: 5 })).toEqual([]);
  });
});

describe('filterCafes — openNow', () => {
  it('only OPEN cafes pass; CLOSED and UNKNOWN are excluded', () => {
    const result = filterCafes([open, closed, unknownHours], { openNow: true });
    expect(result.map((c) => c.placeId)).toEqual(['open']);
  });

  it('openNow: false does not filter by open status', () => {
    const cafes = [open, closed, unknownHours];
    expect(filterCafes(cafes, { openNow: false })).toEqual(cafes);
  });
});

describe('filterCafes — combined filters', () => {
  it('applies minRating and openNow together', () => {
    const highRatedOpen = cafe({ placeId: 'high-open', rating: 4.9, openStatus: 'OPEN' });
    const highRatedClosed = cafe({ placeId: 'high-closed', rating: 4.9, openStatus: 'CLOSED' });
    const lowRatedOpen = cafe({ placeId: 'low-open', rating: 2.0, openStatus: 'OPEN' });

    const result = filterCafes([highRatedOpen, highRatedClosed, lowRatedOpen], {
      minRating: 4,
      openNow: true,
    });
    expect(result.map((c) => c.placeId)).toEqual(['high-open']);
  });
});
