import type { CafeSearchRequest, SearchCenter } from '@bean-stalker/contracts';

/**
 * Canonical T07 search defaults. The brain does not yet expose user-facing
 * radius/rank/result controls (that is T09), so T07 issues one deliberate
 * request per resolved location using these fixed values:
 *
 * - `radiusMeters: 2000` — [[Open Questions|OQ-002]] baseline (2 km).
 * - `maxResults: 10` — conservative within the 1–20 contract bound; keeps
 *   provider payloads and the marker set small. Recorded as a T07
 *   implementation assumption.
 * - `rankPreference: 'DISTANCE'` — neutral "nearby" ordering for a discovery
 *   MVP; deterministic and independent of the rating tie-break still open in
 *   [[Open Questions|OQ-008]]. Recorded as a T07 implementation assumption.
 */
export const CAFE_SEARCH_DEFAULTS = {
  radiusMeters: 2000,
  maxResults: 10,
  rankPreference: 'DISTANCE',
} as const;

/**
 * Converts Bean Stalker's own `SearchCenter` into the wire `CafeSearchRequest`.
 * `SearchCenter` carries an optional `label` for the UI; the request `center`
 * is a strict `LatLng`, so the label is intentionally dropped here — the
 * conversion between the domain model and the transport shape stays in one
 * place.
 */
export function buildCafeSearchRequest(center: SearchCenter): CafeSearchRequest {
  return {
    center: { latitude: center.latitude, longitude: center.longitude },
    radiusMeters: CAFE_SEARCH_DEFAULTS.radiusMeters,
    maxResults: CAFE_SEARCH_DEFAULTS.maxResults,
    rankPreference: CAFE_SEARCH_DEFAULTS.rankPreference,
  };
}

/**
 * Deterministic TanStack Query key derived only from the request parameters
 * that actually change the provider result. Semantically identical requests
 * therefore address the same cache entry, and floating-point-identical
 * coordinates do not create duplicate entries. Coordinates are not rounded —
 * no canonical normalization rule exists ([[Search Result Freshness]] keys on
 * "normalized search center/radius/rank parameters"; normalization here means
 * "the validated request", not lossy rounding).
 */
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
