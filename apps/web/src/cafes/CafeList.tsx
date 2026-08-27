import type { Cafe } from '@bean-stalker/contracts';
import { CafeCard } from './CafeCard.js';

export interface CafeListProps {
  cafes: Cafe[];
  selectedCafeId: string | null;
  onSelectCafe: (placeId: string | null) => void;
}

/**
 * The accessible primary representation of the result set ([[UX Contract]]:
 * "the list is the accessible information surface"). The map consumes the same
 * `cafes` and `selectedCafeId`; neither owns a separate copy.
 */
export function CafeList({ cafes, selectedCafeId, onSelectCafe }: CafeListProps) {
  return (
    <section className="cafe-list" aria-label="Cafe results">
      <h2 className="cafe-list__heading">
        {cafes.length} {cafes.length === 1 ? 'cafe' : 'cafes'} found
      </h2>
      <ul className="cafe-list__items">
        {cafes.map((cafe) => (
          <CafeCard
            key={cafe.placeId}
            cafe={cafe}
            selected={cafe.placeId === selectedCafeId}
            onToggleSelect={onSelectCafe}
          />
        ))}
      </ul>
    </section>
  );
}
