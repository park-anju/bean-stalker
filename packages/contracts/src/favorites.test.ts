import { describe, expect, it } from 'vitest';
import { FavoriteStoreSchema } from './favorites.js';
import type { Cafe } from './cafe.js';

const cafe: Cafe = {
  placeId: 'places/abc123',
  name: 'Sample Cafe',
  location: { latitude: 1.3, longitude: 103.8 },
  openStatus: 'OPEN',
  distanceMeters: 50,
};

describe('FavoriteStoreSchema', () => {
  it('accepts a version-1 store containing a full Cafe snapshot, per the Data Model envelope (see OQ-007 for the compact-snapshot question)', () => {
    const result = FavoriteStoreSchema.safeParse({
      version: 1,
      cafes: [{ placeId: cafe.placeId, savedAt: new Date().toISOString(), snapshot: cafe }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects any store version other than 1, so a future migration cannot be silently misread as the current shape', () => {
    expect(
      FavoriteStoreSchema.safeParse({
        version: 2,
        cafes: [],
      }).success,
    ).toBe(false);
  });

  it('accepts an empty favourites list', () => {
    expect(FavoriteStoreSchema.safeParse({ version: 1, cafes: [] }).success).toBe(true);
  });
});
