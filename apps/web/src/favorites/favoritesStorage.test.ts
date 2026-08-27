import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FavoriteStore } from '@bean-stalker/contracts';
import { EMPTY_FAVORITE_STORE } from '@bean-stalker/domain';
import {
  FAVORITES_STORAGE_KEY,
  readFavoriteStore,
  writeFavoriteStore,
} from './favoritesStorage.js';

const VALID_STORE: FavoriteStore = {
  version: 1,
  cafes: [
    {
      placeId: 'places/kopi',
      savedAt: '2026-08-28T02:00:00.000Z',
      snapshot: {
        placeId: 'places/kopi',
        name: 'Kopi Kenangan',
        location: { latitude: 1.5551, longitude: 110.3489 },
        openStatus: 'OPEN',
        distanceMeters: 1160,
      },
    },
  ],
};

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('readFavoriteStore', () => {
  it('returns an empty store when nothing is persisted', () => {
    expect(readFavoriteStore()).toEqual(EMPTY_FAVORITE_STORE);
  });

  it('round-trips a valid store through localStorage', () => {
    expect(writeFavoriteStore(VALID_STORE)).toEqual({ ok: true });
    expect(readFavoriteStore()).toEqual(VALID_STORE);
  });

  it('falls back to empty on invalid JSON, without touching storage', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, '{this is broken');
    expect(readFavoriteStore()).toEqual(EMPTY_FAVORITE_STORE);
    // the corrupt value is left as-is — recovery happens on the next write
    expect(localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe('{this is broken');
  });

  it('falls back to empty when the shape does not match the schema', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ version: 1, cafes: 'lol' }));
    expect(readFavoriteStore()).toEqual(EMPTY_FAVORITE_STORE);
  });

  it('does not trust an unsupported future version', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ version: 999, cafes: [] }));
    expect(readFavoriteStore()).toEqual(EMPTY_FAVORITE_STORE);
  });

  it('degrades to empty when localStorage.getItem throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(readFavoriteStore()).toEqual(EMPTY_FAVORITE_STORE);
  });
});

describe('writeFavoriteStore', () => {
  it('reports ok: false when localStorage.setItem throws (quota / disabled)', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });
    expect(writeFavoriteStore(VALID_STORE)).toEqual({ ok: false });
  });

  it('rejects a structurally invalid store instead of persisting it', () => {
    const bad = { version: 2, cafes: [] } as unknown as FavoriteStore;
    expect(writeFavoriteStore(bad)).toEqual({ ok: false });
    expect(localStorage.getItem(FAVORITES_STORAGE_KEY)).toBeNull();
  });
});
