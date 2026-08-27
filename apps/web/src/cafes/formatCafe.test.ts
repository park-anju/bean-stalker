import { describe, expect, it } from 'vitest';
import {
  describeOpenStatus,
  describeRating,
  formatDistance,
  formatPriceLevel,
} from './formatCafe.js';

describe('formatDistance', () => {
  it('uses metres below 1 km and kilometres above', () => {
    expect(formatDistance(350)).toBe('350 m away');
    expect(formatDistance(999.4)).toBe('999 m away');
    expect(formatDistance(1200)).toBe('1.2 km away');
    expect(formatDistance(15320)).toBe('15.3 km away');
  });
});

describe('formatPriceLevel', () => {
  it('maps known Google price levels to short labels', () => {
    expect(formatPriceLevel('PRICE_LEVEL_INEXPENSIVE')).toBe('$');
    expect(formatPriceLevel('PRICE_LEVEL_VERY_EXPENSIVE')).toBe('$$$$');
    expect(formatPriceLevel('PRICE_LEVEL_FREE')).toBe('Free');
  });

  it('returns null for missing or unrecognised values rather than inventing one', () => {
    expect(formatPriceLevel(undefined)).toBeNull();
    expect(formatPriceLevel('PRICE_LEVEL_UNSPECIFIED')).toBeNull();
  });
});

describe('describeOpenStatus', () => {
  it('never reports UNKNOWN as closed', () => {
    expect(describeOpenStatus('OPEN')).toEqual({ label: 'Open now', tone: 'open' });
    expect(describeOpenStatus('CLOSED')).toEqual({ label: 'Closed', tone: 'closed' });
    expect(describeOpenStatus('UNKNOWN')).toEqual({ label: 'Hours unavailable', tone: 'unknown' });
  });
});

describe('describeRating', () => {
  it('shows rating and count when present', () => {
    expect(describeRating({ rating: 4.8, userRatingCount: 342 })).toEqual({
      hasRating: true,
      text: '4.8 ★ (342)',
    });
  });

  it('shows the rating alone when the count is missing', () => {
    expect(describeRating({ rating: 4, userRatingCount: undefined })).toEqual({
      hasRating: true,
      text: '4.0 ★',
    });
  });

  it('reports missing ratings honestly', () => {
    expect(describeRating({ rating: undefined, userRatingCount: undefined })).toEqual({
      hasRating: false,
      text: 'No rating data',
    });
  });
});
