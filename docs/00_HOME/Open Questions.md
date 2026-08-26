---
id: HOME-OPEN-QUESTIONS
type: execution-state
status: approved
version: 1.0
authority: execution
owner: Project Owner
updated: 2026-08-27
---
# Open Questions

## OQ-001 — Deployment provider

**Question:** Which low-cost host should run `apps/web` and `apps/api` for the public demo?

**Status:** open; does not block local implementation.

**Decision criteria:** free/low-cost feasibility, environment-secret support, HTTPS, deployment simplicity, and ability to preserve server-side Places credentials.

## OQ-002 — Search radius default

**Question:** Should the initial default be 1 km, 2 km or another value?

**Baseline assumption:** 2 km, user-adjustable within P0 limits. Validate through usability testing.

## OQ-003 — Cafe type breadth

**Question:** Should P0 include only Google `cafe`/coffee-oriented types or broader bakery/restaurant venues?

**Baseline:** cafe-focused results only. Broadening the provider type set requires an explicit scope decision.

## OQ-004 — Result photos

**Question:** Should cafe photos be included in P0?

**Baseline:** deferred. Photos add API/policy/cost/UI complexity and are not required to demonstrate discovery architecture.

## OQ-005 — Resume publication name

**Question:** Keep the humorous “Bean Stalker” name publicly or use a neutral subtitle such as “Bean Stalker — Cafe Discovery App”?

**Status:** presentation choice; does not affect implementation.

## OQ-006 — Health endpoint path mismatch

**Question:** `openapi.yaml` and [[API Contract]] specify `GET /api/v1/health`, but T00's `apps/api` implementation registers a bare `GET /health` with no route prefix or version segment.

**Status:** open; discovered during T01 while reading T01's canonical context. Non-blocking for T01 (contracts/env validation do not touch routing). Does not require reopening T00's DONE status — the endpoint works and was validated against its own (unversioned) shape.

**Resolution point:** should be reconciled when T05 (Fastify cafe search + Google provider adapter) introduces the `/api/v1/cafes/search` route — at that point either add an `/api/v1` prefix to the existing health route to match the canonical contract, or update `openapi.yaml`/[[API Contract]] if an unprefixed path is deliberately preferred. Do not resolve silently; pick one and record the reasoning.

## OQ-007 — Favourite snapshot shape: full `Cafe` vs compact display fields

**Question:** [[Data Model]] (rank 8, system design) literally types the favourite envelope's `snapshot` field as the full `Cafe` interface. [[Favorite Cafe Model]] (rank 4, domain semantics — higher precedence per [[Source of Truth Map]]) instead describes "a compact display snapshot: name, address, coordinates, rating/open status if known at save time," which is a narrower shape than `Cafe`.

**Status:** open; discovered during T01 while implementing `packages/contracts`' shared `Cafe`/favourite schemas. T01's directly linked canonical docs (Data Model, API Key Boundaries, API Contract) do not include [[Favorite Cafe Model]], so T01 implements the favourite envelope schema literally per [[Data Model]] (`snapshot: Cafe`) without assuming the compact-field answer.

**Resolution point:** must be resolved before/during T02 (domain helpers) or T10 (localStorage favourites), whichever actually builds the favourite persistence logic — pick either "store the full normalized `Cafe`" (simpler, some storage overhead, already-fresh data if re-shown) or "store a narrower compact projection" (matches [[Favorite Cafe Model]]'s wording, smaller storage footprint) and update whichever document loses out.
