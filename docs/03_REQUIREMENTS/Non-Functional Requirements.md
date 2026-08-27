---
id: REQ-NONFUNCTIONAL
type: requirements-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-28
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

### RM0 — portfolio no-cost operating constraint

Bean Stalker's public portfolio deployment must be designed to remain within
no-cost third-party usage under expected portfolio traffic. The application must
avoid unnecessary Google Places and Maps requests. **Accidental paid usage is a
release blocker**, not a tuning issue.

- **T07 (frontend request discipline)** — one committed `SearchCenter` produces
  at most one provider request; rerenders, window focus, network reconnect,
  component remount, map pan/zoom, marker/card selection and error auto-retry
  must never issue a provider request; identical fresh searches are served from
  cache. Implemented via [[ADR-007 Cost-Safe Search Orchestration]].
- **Deferred to release/hardening tasks** — Fastify rate limiting, Google Cloud
  daily quota caps, budget/usage alerts, production API-key restrictions,
  server-side caching, and live billing-enabled verification. Tracked as
  [[Known Blockers|BLK-003]].

## NFR-010 — browser support
Target current evergreen desktop/mobile browsers that support required APIs; unsupported geolocation falls back to manual location selection.
