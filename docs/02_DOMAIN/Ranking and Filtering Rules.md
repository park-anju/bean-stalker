---
id: DOMAIN-RANKING-FILTERING
type: domain-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Ranking and Filtering Rules

## Provider rank preference

P0 may request provider ranking by `POPULARITY` or `DISTANCE` where supported. Bean Stalker then exposes local sorting of the returned set.

## Local sort rules

### Distance
Ascending by computed straight-line `distanceMeters`; missing coordinates are placed last.

### Rating
Descending numeric rating; missing rating is placed after rated cafes. Ties may use rating count then distance.

## Filters

- minimum rating: cafes without a rating do not pass a positive minimum-rating filter;
- open now: only `OPEN` passes; `UNKNOWN` is not treated as open;
- favourite: based on local favourite membership;
- reset: returns to default unfiltered set.

## Stability

Sorting/filtering operates on the normalized current result set and must not mutate provider data objects in place.

## UX wording

Distance is labeled approximate straight-line distance unless a later directions integration provides route distance.
