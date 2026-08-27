import type { Cafe } from '@bean-stalker/contracts';
import { useFavorites } from './useFavorites.js';

export interface FavoriteButtonProps {
  cafe: Cafe;
}

/**
 * A toggle button for favouriting a cafe. Renders as its own `<button>` — it
 * is always a *sibling* of any card selection control or link, never nested
 * inside one. State is conveyed by `aria-pressed` and by a text label
 * ("Save" / "Saved"), not by colour alone.
 */
export function FavoriteButton({ cafe }: FavoriteButtonProps) {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const favorited = favoriteIds.has(cafe.placeId);

  return (
    <button
      type="button"
      className="favorite-button"
      aria-pressed={favorited}
      aria-label={
        favorited ? `Remove ${cafe.name} from favourites` : `Add ${cafe.name} to favourites`
      }
      onClick={() => toggleFavorite(cafe)}
    >
      <span className="favorite-button__glyph" aria-hidden="true">
        {favorited ? '★' : '☆'}
      </span>
      <span className="favorite-button__label">{favorited ? 'Saved' : 'Save'}</span>
    </button>
  );
}
