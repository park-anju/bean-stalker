---
id: DOMAIN-BUSINESS-RULES
type: domain-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Business Rules

## BR-01 — valid search center
A provider search requires validated latitude/longitude and an allowed radius.

## BR-02 — recoverable geolocation
Denied/unavailable geolocation never blocks manual search.

## BR-03 — provider identity
Cafe deduplication and favourite identity use provider `placeId`, not name/address.

## BR-04 — live-data integrity
Values presented as provider facts come from the current/cached provider response or are explicitly marked unavailable/unknown. No fabricated fallback ratings, prices or opening status.

## BR-05 — explicit unknown
Missing optional provider fields remain unknown; absence is not converted into a negative claim.

## BR-06 — favourite locality
P0 favourites remain local to the current browser/device.

## BR-07 — credential boundary
Server-side Places credentials never enter browser bundles, logs or committed source.

## BR-08 — minimal field retrieval
Production search requests use an explicit field mask limited to fields required by [[MVP Scope]].

## BR-09 — bounded queries
Radius/result count are constrained server-side so client input cannot create unbounded external requests.

## BR-10 — stale response safety
An older in-flight search result must not replace the UI for a newer search intent.

These rules are verified through [[Test Case Catalog]] and [[Acceptance Matrix]].
