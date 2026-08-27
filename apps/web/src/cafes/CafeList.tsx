import type { Cafe } from '@bean-stalker/contracts';
import { CafeCard } from './CafeCard.js';

export interface CafeListProps {
  cafes: Cafe[];
  selectedCafeId: string | null;
  onSelectCafe: (placeId: string | null) => void;
  /** Total cafes returned before local filtering; when larger than `cafes.length` the heading shows "X of Y". */
  totalCount?: number;
}

/**
 * The accessible primary representation of the result set ([[UX Contract]]:
 * "the list is the accessible information surface"). The map consumes the same
 * (filtered + sorted) `cafes` and `selectedCafeId`; neither owns a separate copy.
 */
export function CafeList({ cafes, selectedCafeId, onSelectCafe, totalCount }: CafeListProps) {
  const shown = cafes.length;
  const total = totalCount ?? shown;
  const heading =
    total > shown
      ? `${shown} of ${total} cafes shown`
      : `${shown} ${shown === 1 ? 'cafe' : 'cafes'} found`;

  return (
    <section className="cafe-list" aria-label="Cafe results">
      <h2 className="cafe-list__heading">{heading}</h2>
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
