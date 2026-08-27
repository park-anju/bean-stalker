import { useEffect, useRef } from 'react';
import type { Cafe } from '@bean-stalker/contracts';
import { FavoriteButton } from '../favorites/FavoriteButton.js';
import { CafeSummary } from './CafeSummary.js';

export interface CafeCardProps {
  cafe: Cafe;
  selected: boolean;
  onToggleSelect: (placeId: string | null) => void;
}

export function CafeCard({ cafe, selected, onToggleSelect }: CafeCardProps) {
  const containerRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    // When selection comes from a map marker, bring the matching card into
    // view. Guarded because jsdom does not implement scrollIntoView.
    if (selected) {
      containerRef.current?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [selected]);

  return (
    <li ref={containerRef} className="cafe-card" data-selected={selected || undefined}>
      <div className="cafe-card__header">
        {/* Selection toggle and favourite toggle are siblings — never nested. */}
        <button
          type="button"
          className="cafe-card__select"
          aria-pressed={selected}
          onClick={() => onToggleSelect(selected ? null : cafe.placeId)}
        >
          <span className="cafe-card__name">{cafe.name}</span>
        </button>
        <FavoriteButton cafe={cafe} />
      </div>

      {selected && <span className="cafe-card__selected-flag">Selected</span>}

      <CafeSummary cafe={cafe} />
    </li>
  );
}
