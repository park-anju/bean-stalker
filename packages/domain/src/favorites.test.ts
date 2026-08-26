import { describe, expect, it } from 'vitest';
import { EMPTY_FAVORITE_STORE, addFavorite, isFavorite, removeFavorite } from './favorites.js';
import type { Cafe } from '@bean-stalker/contracts';

const cafeA: Cafe = {
  placeId: 'places/a',
  name: 'Cafe A',
  location: { latitude: 1.55, longitude: 110.36 },
  openStatus: 'OPEN',
  distanceMeters: 120,
};

const cafeB: Cafe = {
  placeId: 'places/b',
  name: 'Cafe B',
  location: { latitude: 1.56, longitude: 110.37 },
  openStatus: 'UNKNOWN',
  distanceMeters: 400,
};

describe('addFavorite / isFavorite', () => {
  it('adds a cafe and it is then detected as a favourite', () => {
    const store = addFavorite(EMPTY_FAVORITE_STORE, cafeA);
    expect(isFavorite(store, cafeA.placeId)).toBe(true);
  });

  it('is idempotent: adding the same cafe twice results in exactly one record', () => {
    const once = addFavorite(EMPTY_FAVORITE_STORE, cafeA);
    const twice = addFavorite(once, cafeA);
    expect(twice.cafes).toHaveLength(1);
  });

  it('returns the same store reference when the cafe is already favourited (true no-op)', () => {
    const once = addFavorite(EMPTY_FAVORITE_STORE, cafeA);
    const twice = addFavorite(once, cafeA);
    expect(twice).toBe(once);
  });

  it('supports multiple distinct favourites', () => {
    const store = addFavorite(addFavorite(EMPTY_FAVORITE_STORE, cafeA), cafeB);
    expect(store.cafes.map((record) => record.placeId).sort()).toEqual([
      cafeA.placeId,
      cafeB.placeId,
    ]);
  });

  it('stores the full normalized Cafe as the snapshot (OQ-007 resolution)', () => {
    const store = addFavorite(EMPTY_FAVORITE_STORE, cafeA);
    expect(store.cafes[0]?.snapshot).toEqual(cafeA);
  });

  it('does not mutate the input store', () => {
    const before = { ...EMPTY_FAVORITE_STORE, cafes: [...EMPTY_FAVORITE_STORE.cafes] };
    addFavorite(EMPTY_FAVORITE_STORE, cafeA);
    expect(EMPTY_FAVORITE_STORE).toEqual(before);
  });
});

describe('removeFavorite', () => {
  it('removes an existing favourite', () => {
    const store = addFavorite(EMPTY_FAVORITE_STORE, cafeA);
    const after = removeFavorite(store, cafeA.placeId);
    expect(isFavorite(after, cafeA.placeId)).toBe(false);
  });

  it('removing one favourite does not affect another', () => {
    const store = addFavorite(addFavorite(EMPTY_FAVORITE_STORE, cafeA), cafeB);
    const after = removeFavorite(store, cafeA.placeId);
    expect(isFavorite(after, cafeB.placeId)).toBe(true);
  });

  it('removing an absent favourite is a safe no-op that returns the same reference', () => {
    const after = removeFavorite(EMPTY_FAVORITE_STORE, 'places/never-added');
    expect(after).toBe(EMPTY_FAVORITE_STORE);
  });
});
