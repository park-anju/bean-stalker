import { useFavorites } from './useFavorites.js';

/**
 * Surfaces a bounded, favourite-specific message when a favourite change could
 * not be written to localStorage (storage disabled, quota, security error).
 * It never turns into a cafe-search error and never shows a raw exception.
 */
export function FavoritePersistenceNotice() {
  const { persistenceError } = useFavorites();
  if (!persistenceError) return null;

  return (
    <p className="favorite-persistence-notice" role="alert">
      Your last favourite change could not be saved in this browser. Favourites may not persist
      after you reload.
    </p>
  );
}
