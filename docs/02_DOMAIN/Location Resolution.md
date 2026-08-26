---
id: DOMAIN-LOCATION-RESOLUTION
type: domain-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Location Resolution

## Supported origins

1. **Current location** — browser Geolocation API after explicit user action/permission.
2. **Manual location** — a user-selected place/location resolved by Google Maps client-side location tooling.

Both paths produce the same canonical `SearchCenter { latitude, longitude, label? }`.

## Privacy invariant

Precise user coordinates are transient search input. P0 does not persist raw current-location history to localStorage or server databases.

## Permission outcomes

- granted → resolve center and continue;
- denied → explain and offer manual selection;
- unavailable → explain and offer manual selection;
- timeout → allow retry or manual selection.

## Accuracy

Browser coordinates can be imprecise. Bean Stalker does not claim exact physical position. A user can override the search center manually.

## Validation

Latitude must be `[-90, 90]`; longitude `[-180, 180]`. Invalid centers fail before provider calls.

See [[Privacy Boundaries]], [[Search Lifecycle]] and [[Functional Requirements]].
