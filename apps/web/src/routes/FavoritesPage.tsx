import { Link } from 'react-router-dom';
import { CafeSummary } from '../cafes/CafeSummary.js';
import { FavoriteButton } from '../favorites/FavoriteButton.js';
import { useFavorites } from '../favorites/useFavorites.js';

function savedOn(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? 'an unknown date'
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function FavoritesPage() {
  const { favorites } = useFavorites();

  return (
    <section className="favorites-page">
      <h1>Favorites</h1>

      {favorites.length === 0 ? (
        <div className="favorites-page__empty">
          <p>No favourites saved yet.</p>
          <p>
            <Link to="/">Find cafes to save</Link> on the home page, then use the{' '}
            <strong>Save</strong> button on any result to keep it here.
          </p>
        </div>
      ) : (
        <>
          <p className="favorites-page__note">
            Saved on this browser/device only — there&apos;s no account or cloud sync. Ratings,
            opening status and other details are a snapshot from when you saved the cafe and may be
            out of date; search again on Discovery for current data.
          </p>
          <ul className="cafe-list__items" aria-label="Saved cafes">
            {favorites.map((record) => (
              <li key={record.placeId} className="cafe-card">
                <div className="cafe-card__header">
                  <span className="cafe-card__name">{record.snapshot.name}</span>
                  <FavoriteButton cafe={record.snapshot} />
                </div>
                <p className="favorites-page__saved-at">Saved {savedOn(record.savedAt)}</p>
                <CafeSummary cafe={record.snapshot} showDistance={false} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
