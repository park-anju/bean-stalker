---
id: BUS-MVP-SCOPE
type: business-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# MVP Scope

## P0 — must ship in the three-day build

### Discovery
- use current browser geolocation when permission is granted;
- allow manual location selection/search when geolocation is denied or not desired;
- search nearby cafes from a latitude/longitude center;
- show list and map representations;
- show explicit loading, empty and error states.

### Result information
- cafe name;
- formatted address when available;
- rating and user rating count when available;
- price level when available;
- open/closed/unknown when supported by returned provider data;
- distance computed locally from search center;
- Google Maps destination link when available.

### Refinement
- sort by distance;
- sort by rating;
- filter by minimum rating;
- filter to currently open only when status is known;
- reset filters.

### Favourites
- favourite/unfavourite a cafe;
- persist favourite cafe snapshots/reference IDs in localStorage;
- display a favourites view or filter.

### Engineering quality
- browser/server key separation;
- Zod contract validation;
- deterministic tests for domain helpers and API mapping;
- at least one Playwright happy-path using mocked provider traffic;
- README and architecture documentation;
- deployed demo if credentials/host permit.

## P0 exclusions

- authentication;
- database;
- cloud sync;
- cafe photos;
- directions/navigation engine;
- user reviews;
- recommendations/personalization;
- push notifications;
- admin panel;
- multi-language support.

## P1 — after resume MVP

- photo support with policy/cost review;
- richer place details;
- recent searches;
- PWA/installability;
- shareable search URLs;
- accessibility polish beyond baseline;
- usage telemetry dashboard.

## P2 — only with a product reason

- accounts and cloud sync;
- social lists;
- recommendation engine;
- merchant features.

Any P0 scope expansion must update [[Task Graph]], [[Task Status]] and [[Release Readiness]].
