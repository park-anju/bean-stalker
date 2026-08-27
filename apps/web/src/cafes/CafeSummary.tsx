import type { Cafe } from '@bean-stalker/contracts';
import {
  describeOpenStatus,
  describeRating,
  formatDistance,
  formatPriceLevel,
} from './formatCafe.js';

export interface CafeSummaryProps {
  cafe: Cafe;
  /**
   * Show the straight-line distance. Off on the Favorites page, where a
   * snapshot's `distanceMeters` is relative to a past search centre and has
   * no meaningful reference point.
   */
  showDistance?: boolean;
}

/**
 * Shared, control-free presentation of a cafe's information — used both for
 * live search results and for saved favourite snapshots. Honest labels for
 * missing data; the Google Maps link appears only when a URI is present.
 */
export function CafeSummary({ cafe, showDistance = true }: CafeSummaryProps) {
  const open = describeOpenStatus(cafe.openStatus);
  const rating = describeRating(cafe);
  const price = formatPriceLevel(cafe.priceLevel);

  return (
    <>
      <p className="cafe-card__meta">
        {showDistance && <span>{formatDistance(cafe.distanceMeters)}</span>}
        <span className={`cafe-card__open cafe-card__open--${open.tone}`}>{open.label}</span>
        <span>{rating.text}</span>
        {price && <span aria-label={`Price level ${price}`}>{price}</span>}
      </p>

      {cafe.formattedAddress && <p className="cafe-card__address">{cafe.formattedAddress}</p>}

      {cafe.googleMapsUri && (
        <a
          className="cafe-card__maps-link"
          href={cafe.googleMapsUri}
          target="_blank"
          rel="noreferrer noopener"
        >
          Open in Google Maps
          <span className="visually-hidden"> — {cafe.name}</span>
        </a>
      )}
    </>
  );
}
