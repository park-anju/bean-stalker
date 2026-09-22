---
id: IFACE-SCREEN-INVENTORY
type: interface-spec
status: approved
version: 1.1
authority: canonical
owner: Project Owner
updated: 2026-09-19
---
# Screen Inventory

## SCR-01 — Discovery

Primary page containing:
- brand/header;
- automatic current-location status and explicit retry action;
- radius/rank controls as scoped;
- automatic initial search plus explicit provider retry when relevant;
- filter/sort bar;
- results list;
- map;
- selected cafe details/action area;
- loading/empty/error states.

## SCR-02 — Favourites

Shows locally saved cafes and allows unfavourite/open-in-Maps. It must indicate that saved snapshots may be stale and are local to this browser/device.

## Responsive behaviour

Desktop may use split list/map. Mobile prioritizes list usability with map available without blocking primary information.

## Component inventory

- `LocationSelector`
- `SearchControls`
- `FilterBar`
- `CafeList`
- `CafeCard`
- `CafeMap`
- `CafeMarker`
- `CafeDetailPanel`
- `FavoriteButton`
- `SearchStatePanel`

See [[UX Contract]].
