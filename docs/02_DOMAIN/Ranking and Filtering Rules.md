---
id: DOMAIN-RANKING-FILTERING
type: domain-spec
status: approved
version: 1.1
authority: canonical
owner: Project Owner
updated: 2026-08-28
---
# Ranking and Filtering Rules

## Provider rank preference

P0 may request provider ranking by `POPULARITY` or `DISTANCE` where supported. Bean Stalker then exposes local sorting of the returned set. The provider `rankPreference` governs *which* cafes are retrieved; the local sort (below) governs only the *presentation order* of the already-returned `Cafe[]`. A local sort change never alters `rankPreference` and never triggers a new provider request.

## Local sort rules

### Distance
Ascending by computed straight-line `distanceMeters`; missing coordinates are placed last.

### Rating
Descending numeric rating; missing rating is placed after rated cafes. The tie-break order is:

1. higher numeric `rating` first;
2. on equal rating, **higher `userRatingCount` first** — a rating backed by more reviews is more socially validated (a cafe with no `userRatingCount` counts as 0);
3. on equal review count, **smaller `distanceMeters` first**;
4. still tied → preserve the incoming order (stable sort).

This confirms the T02 implementation and closes [[Open Questions|OQ-008]]. No higher-authority source specifies a different direction.

## Filters

- minimum rating: cafes without a rating do not pass a positive minimum-rating filter;
- open now: only `OPEN` passes; `UNKNOWN` is not treated as open;
- favourite: based on local favourite membership;
- reset: returns to default unfiltered set.

## Stability

Sorting/filtering operates on the normalized current result set and must not mutate provider data objects in place.

## UX wording

Distance is labeled approximate straight-line distance unless a later directions integration provides route distance.
