import { useContext } from 'react';
import { FavoritesContext, type FavoritesContextValue } from './favoritesContext.js';

/**
 * Access the shared, localStorage-backed favourites state. Must be used inside
 * a {@link FavoritesProvider} — a missing provider is a wiring bug, so this
 * throws rather than silently returning an inert value.
 */
export function useFavorites(): FavoritesContextValue {
  const value = useContext(FavoritesContext);
  if (!value) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return value;
}
