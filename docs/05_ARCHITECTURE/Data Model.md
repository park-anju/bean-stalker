---
id: ARCH-DATA-MODEL
type: architecture-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Data Model

P0 has no relational database. This note owns normalized application data shapes and browser-persistent favourite shape.

## Search request

```ts
interface CafeSearchRequest {
  center: { latitude: number; longitude: number };
  radiusMeters: number;
  maxResults: number;
  rankPreference: 'POPULARITY' | 'DISTANCE';
}
```

## Cafe

```ts
interface Cafe {
  placeId: string;
  name: string;
  location: { latitude: number; longitude: number };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  openStatus: 'OPEN' | 'CLOSED' | 'UNKNOWN';
  businessStatus?: string;
  googleMapsUri?: string;
  distanceMeters: number;
}
```

## Search response

```ts
interface CafeSearchResponse {
  searchCenter: { latitude: number; longitude: number };
  fetchedAt: string;
  cafes: Cafe[];
}
```

## Favourite envelope

```ts
interface FavoriteStoreV1 {
  version: 1;
  cafes: Array<{
    placeId: string;
    savedAt: string;
    snapshot: Cafe;
  }>;
}
```

## Invariants

- `placeId` non-empty;
- latitude/longitude valid;
- `distanceMeters >= 0`;
- rating, when present, within provider-supported numeric domain and validated;
- missing open-state data becomes `UNKNOWN`;
- API response never includes provider secret or raw provider payload.

The runtime contract is implemented in `packages/contracts` after T01 and mirrored by `openapi.yaml`.
