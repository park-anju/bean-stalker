---
id: DOMAIN-CAFE-DISCOVERY
type: domain-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Cafe Discovery Model

## Core concepts

```mermaid
classDiagram
  class SearchContext {
    latitude
    longitude
    radiusMeters
    rankPreference
  }
  class Cafe {
    placeId
    name
    latitude
    longitude
    address?
    rating?
    ratingCount?
    priceLevel?
    openStatus
    googleMapsUri?
    distanceMeters
  }
  class SearchResultSet {
    fetchedAt
    source
    cafes[]
  }
  class FavoriteCafe {
    placeId
    savedAt
    snapshot
  }
  SearchContext --> SearchResultSet
  SearchResultSet --> Cafe
  FavoriteCafe --> Cafe
```

## Identities

- Provider `placeId` is the stable external identity used to deduplicate and favourite cafes.
- Search result order is not identity.
- Cafe display name is not identity.

## Normalization

Provider responses are normalized at the API/application boundary into Bean Stalker contracts. Optional provider fields remain optional.

## Open status

Canonical vocabulary:
- `OPEN`
- `CLOSED`
- `UNKNOWN`

Never infer `OPEN` merely from the existence of opening-hours data.

## Distance

Distance is a client/domain-derived straight-line estimate from current search center to cafe coordinates. It is **not travel distance** and must not be labeled as driving/walking distance.

See [[Search Lifecycle]], [[Ranking and Filtering Rules]], [[Favorite Cafe Model]] and [[Business Rules]].
