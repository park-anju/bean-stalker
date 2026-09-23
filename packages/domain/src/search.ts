import type { CafeSearchRequest, SearchCenter } from '@bean-stalker/contracts';

/** Canonical provider-search defaults shared by web and native clients. */
export const CAFE_SEARCH_DEFAULTS = {
  radiusMeters: 2000,
  maxResults: 10,
  rankPreference: 'DISTANCE',
} as const;

export function buildCafeSearchRequest(center: SearchCenter): CafeSearchRequest {
  return {
    center: { latitude: center.latitude, longitude: center.longitude },
    radiusMeters: CAFE_SEARCH_DEFAULTS.radiusMeters,
    maxResults: CAFE_SEARCH_DEFAULTS.maxResults,
    rankPreference: CAFE_SEARCH_DEFAULTS.rankPreference,
  };
}

export function cafeSearchQueryKey(request: CafeSearchRequest) {
  return [
    'cafes',
    'search',
    request.center.latitude,
    request.center.longitude,
    request.radiusMeters,
    request.maxResults,
    request.rankPreference,
  ] as const;
}
