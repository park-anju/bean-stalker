import type { Cafe, FavoriteRecord, FavoriteStore } from '@bean-stalker/contracts';

export const EMPTY_FAVORITE_STORE: FavoriteStore = { version: 1, cafes: [] };

export function isFavorite(store: FavoriteStore, placeId: string): boolean {
  return store.cafes.some((record) => record.placeId === placeId);
}

export function addFavorite(store: FavoriteStore, cafe: Cafe): FavoriteStore {
  if (isFavorite(store, cafe.placeId)) {
    return store;
  }

  const record: FavoriteRecord = {
    placeId: cafe.placeId,
    savedAt: new Date().toISOString(),
    snapshot: cafe,
  };
  return { ...store, cafes: [...store.cafes, record] };
}

export function removeFavorite(store: FavoriteStore, placeId: string): FavoriteStore {
  if (!isFavorite(store, placeId)) {
    return store;
  }

  return { ...store, cafes: store.cafes.filter((record) => record.placeId !== placeId) };
}
