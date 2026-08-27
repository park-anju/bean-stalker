import type { Cafe } from '@bean-stalker/contracts';
import { filterCafes, sortCafes, type CafeSortMode } from '@bean-stalker/domain';

/**
 * Local, client-only refinement of the already-fetched `Cafe[]`. None of these
 * fields ever enters the `CafeSearchRequest` or the TanStack Query key — a
 * change here transforms the existing result set and issues **zero** provider
 * requests (RM0 / [[ADR-007 Cost-Safe Search Orchestration]]).
 */
export interface DiscoveryFilters {
  /** Minimum star rating; `0` means "any", and (per T02's `filterCafes`) does not exclude unrated cafes. */
  minRating: number;
  /** When true, only cafes whose `openStatus` is `OPEN` are shown (`UNKNOWN` is not "open"). */
  openNowOnly: boolean;
  /** Presentation order of the returned cafes — not the provider `rankPreference`. */
  sortBy: CafeSortMode;
}

/**
 * Defaults deliberately reproduce T07's result ordering and hide nothing:
 * no rating threshold, Open Now off, distance sort ([[Open Questions|OQ-011]]).
 */
export const DEFAULT_DISCOVERY_FILTERS: DiscoveryFilters = {
  minRating: 0,
  openNowOnly: false,
  sortBy: 'DISTANCE',
};

export interface MinRatingOption {
  value: number;
  label: string;
}

/** Bounded, simple choices — no free decimal entry ([[UX Contract]] / task scope). */
export const MIN_RATING_OPTIONS: readonly MinRatingOption[] = [
  { value: 0, label: 'Any rating' },
  { value: 3, label: '3+' },
  { value: 3.5, label: '3.5+' },
  { value: 4, label: '4+' },
  { value: 4.5, label: '4.5+' },
];

export interface SortOption {
  value: CafeSortMode;
  label: string;
}

export const SORT_OPTIONS: readonly SortOption[] = [
  { value: 'DISTANCE', label: 'Distance' },
  { value: 'RATING', label: 'Rating' },
];

export function isDefaultFilters(filters: DiscoveryFilters): boolean {
  return (
    filters.minRating === DEFAULT_DISCOVERY_FILTERS.minRating &&
    filters.openNowOnly === DEFAULT_DISCOVERY_FILTERS.openNowOnly &&
    filters.sortBy === DEFAULT_DISCOVERY_FILTERS.sortBy
  );
}

/**
 * Filter first, then sort the survivors — clearer and cheaper than sorting
 * cafes that are about to be removed. Delegates entirely to `packages/domain`;
 * no ranking/filtering algorithm is reimplemented here, and the input array
 * (TanStack Query's cached `Cafe[]`) is never mutated — both helpers return a
 * fresh array.
 */
export function applyDiscoveryFilters(cafes: readonly Cafe[], filters: DiscoveryFilters): Cafe[] {
  const filtered = filterCafes(cafes, {
    minRating: filters.minRating,
    openNow: filters.openNowOnly,
  });
  return sortCafes(filtered, filters.sortBy);
}
