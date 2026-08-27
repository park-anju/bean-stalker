import { useEffect, useRef } from 'react';
import type { Cafe } from '@bean-stalker/contracts';
import {
  describeOpenStatus,
  describeRating,
  formatDistance,
  formatPriceLevel,
} from './formatCafe.js';

export interface CafeCardProps {
  cafe: Cafe;
  selected: boolean;
  onToggleSelect: (placeId: string | null) => void;
}

export function CafeCard({ cafe, selected, onToggleSelect }: CafeCardProps) {
  const containerRef = useRef<HTMLLIElement>(null);
  const open = describeOpenStatus(cafe.openStatus);
  const rating = describeRating(cafe);
  const price = formatPriceLevel(cafe.priceLevel);

  useEffect(() => {
    // When selection comes from a map marker, bring the matching card into
    // view. Guarded because jsdom does not implement scrollIntoView.
    if (selected) {
      containerRef.current?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [selected]);

  return (
    <li ref={containerRef} className="cafe-card" data-selected={selected || undefined}>
      <button
        type="button"
        className="cafe-card__select"
        aria-pressed={selected}
        onClick={() => onToggleSelect(selected ? null : cafe.placeId)}
      >
        <span className="cafe-card__name">{cafe.name}</span>
        {selected && <span className="cafe-card__selected-flag">Selected</span>}
      </button>

      <p className="cafe-card__meta">
        <span>{formatDistance(cafe.distanceMeters)}</span>
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
    </li>
  );
}
