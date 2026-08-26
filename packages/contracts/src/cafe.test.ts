import { describe, expect, it } from 'vitest';
import { CafeSchema } from './cafe.js';

const minimalCafe = {
  placeId: 'places/abc123',
  name: 'Sample Cafe',
  location: { latitude: 1.3, longitude: 103.8 },
  openStatus: 'UNKNOWN',
  distanceMeters: 120,
};

describe('CafeSchema', () => {
  it('accepts a cafe with only the required fields, leaving optional provider fields absent rather than fabricated (BR-05)', () => {
    const result = CafeSchema.safeParse(minimalCafe);
    expect(result.success).toBe(true);
  });

  it('only accepts the three documented open-status values, so an unknown state cannot be silently coerced into OPEN or CLOSED (BR-04)', () => {
    expect(CafeSchema.safeParse({ ...minimalCafe, openStatus: 'OPEN' }).success).toBe(true);
    expect(CafeSchema.safeParse({ ...minimalCafe, openStatus: 'MAYBE' }).success).toBe(false);
  });

  it('requires a non-empty placeId, since favourite/dedup identity depends on it (BR-03)', () => {
    expect(CafeSchema.safeParse({ ...minimalCafe, placeId: '' }).success).toBe(false);
  });

  it('rejects a negative distance', () => {
    expect(CafeSchema.safeParse({ ...minimalCafe, distanceMeters: -1 }).success).toBe(false);
  });
});
