import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { Cafe, FavoriteStore } from '@bean-stalker/contracts';
import { addFavorite, isFavorite, removeFavorite as removeFromStore } from '@bean-stalker/domain';
import { FavoritesContext, type FavoritesContextValue } from './favoritesContext.js';
import { readFavoriteStore, writeFavoriteStore } from './favoritesStorage.js';

export interface FavoritesProviderProps {
  children: ReactNode;
  /** Test seam: start from a specific store instead of reading localStorage. */
  initialStore?: FavoriteStore;
}

/**
 * Owns the persistent, browser-local favourites state and shares it with every
 * route. Hydrates from localStorage exactly once (lazy `useState` initializer,
 * not an effect — no flicker, no per-render parse). Fastify never sees any of
 * this; there is no TanStack Query wrapper (favourites are local persistent
 * state, not server state).
 */
export function FavoritesProvider({ children, initialStore }: FavoritesProviderProps) {
  const [store, setStore] = useState<FavoriteStore>(() => initialStore ?? readFavoriteStore());
  const [persistenceError, setPersistenceError] = useState(false);

  // Persist first, commit the UI only if the write succeeded. The UI must
  // never claim a favourite is durably saved when localStorage rejected it.
  const commit = useCallback((next: FavoriteStore) => {
    if (writeFavoriteStore(next).ok) {
      setStore(next);
      setPersistenceError(false);
    } else {
      setPersistenceError(true);
    }
  }, []);

  const toggleFavorite = useCallback(
    (cafe: Cafe) => {
      const next = isFavorite(store, cafe.placeId)
        ? removeFromStore(store, cafe.placeId)
        : addFavorite(store, cafe);
      if (next !== store) commit(next);
    },
    [store, commit],
  );

  const removeFavorite = useCallback(
    (placeId: string) => {
      const next = removeFromStore(store, placeId);
      if (next !== store) commit(next);
    },
    [store, commit],
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteIds: new Set(store.cafes.map((record) => record.placeId)),
      favorites: store.cafes,
      toggleFavorite,
      removeFavorite,
      persistenceError,
    }),
    [store, toggleFavorite, removeFavorite, persistenceError],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
