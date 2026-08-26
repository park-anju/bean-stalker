import type { Cafe } from '@bean-stalker/contracts';

export interface CafeFilterCriteria {
  minRating?: number;
  openNow?: boolean;
}

export function filterCafes(cafes: readonly Cafe[], criteria: CafeFilterCriteria): Cafe[] {
  return cafes.filter((cafe) => {
    // A positive minimum-rating filter excludes unrated cafes; a zero/absent
    // threshold does not, since "at least zero" is vacuously true even for
    // an unknown rating (Ranking and Filtering Rules).
    if (criteria.minRating !== undefined && criteria.minRating > 0) {
      if (cafe.rating === undefined || cafe.rating < criteria.minRating) return false;
    }

    // UNKNOWN is never treated as open (Business Rules BR-04/BR-05).
    if (criteria.openNow && cafe.openStatus !== 'OPEN') return false;

    return true;
  });
}
