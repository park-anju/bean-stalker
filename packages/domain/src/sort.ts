import type { Cafe } from '@bean-stalker/contracts';

export type CafeSortMode = 'DISTANCE' | 'RATING';

function compareByRatingDescending(a: Cafe, b: Cafe): number {
  if (a.rating === undefined && b.rating === undefined) return 0;
  if (a.rating === undefined) return 1;
  if (b.rating === undefined) return -1;

  if (a.rating !== b.rating) return b.rating - a.rating;

  // Tie on rating: prefer the more-reviewed cafe, then the closer one.
  // Ranking and Filtering Rules doesn't specify a direction for the count
  // tiebreaker — see OQ-008.
  const aCount = a.userRatingCount ?? 0;
  const bCount = b.userRatingCount ?? 0;
  if (aCount !== bCount) return bCount - aCount;

  return a.distanceMeters - b.distanceMeters;
}

export function sortCafes(cafes: readonly Cafe[], mode: CafeSortMode): Cafe[] {
  const sorted = [...cafes];
  if (mode === 'DISTANCE') {
    return sorted.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }
  return sorted.sort(compareByRatingDescending);
}
