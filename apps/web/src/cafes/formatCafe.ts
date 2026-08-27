import type { Cafe, OpenStatus } from '@bean-stalker/contracts';

/**
 * Presentation-only formatting of the straight-line `distanceMeters` the API
 * already computed (via `packages/domain`'s Haversine helper). The value is
 * never recomputed in the browser; this only chooses units.
 */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m away`;
  }
  return `${(distanceMeters / 1000).toFixed(1)} km away`;
}

const PRICE_LEVEL_LABELS: Record<string, string> = {
  PRICE_LEVEL_FREE: 'Free',
  PRICE_LEVEL_INEXPENSIVE: '$',
  PRICE_LEVEL_MODERATE: '$$',
  PRICE_LEVEL_EXPENSIVE: '$$$',
  PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
};

/** Returns a short price label, or `null` when the provider gave no usable value. */
export function formatPriceLevel(priceLevel: string | undefined): string | null {
  if (!priceLevel) return null;
  return PRICE_LEVEL_LABELS[priceLevel] ?? null;
}

export interface OpenStatusDisplay {
  label: string;
  tone: 'open' | 'closed' | 'unknown';
}

/**
 * Honest opening-status copy. `UNKNOWN` is "Hours unavailable" — never
 * "Closed" ([[UX Contract]], [[Cafe Discovery Model]], BR-05).
 */
export function describeOpenStatus(openStatus: OpenStatus): OpenStatusDisplay {
  switch (openStatus) {
    case 'OPEN':
      return { label: 'Open now', tone: 'open' };
    case 'CLOSED':
      return { label: 'Closed', tone: 'closed' };
    case 'UNKNOWN':
      return { label: 'Hours unavailable', tone: 'unknown' };
  }
}

export interface RatingDisplay {
  hasRating: boolean;
  text: string;
}

/** `"4.8 ★ (342)"`, `"4.8 ★"`, or `"No rating data"` — no fabricated values. */
export function describeRating(cafe: Pick<Cafe, 'rating' | 'userRatingCount'>): RatingDisplay {
  if (typeof cafe.rating !== 'number') {
    return { hasRating: false, text: 'No rating data' };
  }
  const base = `${cafe.rating.toFixed(1)} ★`;
  if (typeof cafe.userRatingCount === 'number') {
    return { hasRating: true, text: `${base} (${cafe.userRatingCount})` };
  }
  return { hasRating: true, text: base };
}
