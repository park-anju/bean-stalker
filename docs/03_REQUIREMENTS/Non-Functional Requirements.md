---
id: REQ-NONFUNCTIONAL
type: requirements-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Non-Functional Requirements

## NFR-001 — security
No committed secrets; browser and server credentials are separately restricted according to [[API Key Boundaries]].

## NFR-002 — privacy
Precise current-location coordinates are not persisted by P0 beyond what is necessary for the active request/cache. See [[Privacy Boundaries]].

## NFR-003 — performance
On a normal broadband connection, local UI interactions (sort/filter/favourite) should feel immediate. Provider-dependent latency is surfaced with a loading state.

## NFR-004 — accessibility
Primary flows are keyboard operable; controls have accessible names; selected/favourite/open states are not conveyed only by color; map is supplementary to a usable list.

## NFR-005 — responsive design
Core flows remain usable at common mobile and desktop widths.

## NFR-006 — reliability
API/provider failure does not crash the application or silently present stale/empty data as a fresh success.

## NFR-007 — maintainability
TypeScript strictness, shared contracts, bounded modules, linting and tests are required. Avoid `any` as a shortcut.

## NFR-008 — observability
API logs include request correlation, route/outcome/latency and provider failure category without secrets or precise user coordinates at unnecessary precision.

## NFR-009 — cost discipline
External queries are bounded, duplicate refetches are controlled and Places field masks are minimal.

## NFR-010 — browser support
Target current evergreen desktop/mobile browsers that support required APIs; unsupported geolocation falls back to manual location selection.
