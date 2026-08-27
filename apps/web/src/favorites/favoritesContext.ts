import { createContext } from 'react';
import type { Cafe, FavoriteRecord } from '@bean-stalker/contracts';

export interface FavoritesContextValue {
  /** placeIds currently favourited — for O(1) membership checks on cafe cards. */
  favoriteIds: ReadonlySet<string>;
  /** The persisted favourite records, in save order — for the Favorites page. */
  favorites: readonly FavoriteRecord[];
  /** Add the cafe if absent, remove it if present. Persists, then updates UI. */
  toggleFavorite: (cafe: Cafe) => void;
  /** Remove a favourite by placeId (no-op if absent). Persists, then updates UI. */
  removeFavorite: (placeId: string) => void;
  /** True when the last favourite mutation could not be written to localStorage. */
  persistenceError: boolean;
}

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);
