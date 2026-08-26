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

**Status:** RESOLVED during T02.

**Original question:** [[Data Model]] (rank 8, system design) literally types the favourite envelope's `snapshot` field as the full `Cafe` interface. [[Favorite Cafe Model]] (rank 4, domain semantics) instead describes "a compact display snapshot: name, address, coordinates, rating/open status if known at save time," which reads like a narrower shape than `Cafe`.

**Resolution:** not actually a conflict once each document's precedence is applied to the right subject matter. Per [[Source of Truth Map]], domain semantics (rank 4) owns "meaning and invariants," while system design (rank 8) owns "components and data" — i.e. the *exact stored shape*. [[Favorite Cafe Model]]'s "compact display snapshot" phrase, especially its qualifier "if known at save time" (which mirrors `Cafe`'s own optional fields), reads as an informal description of which fields a UI will typically *show* from the snapshot, not a competing formal schema. [[Data Model]] remains authoritative for the literal shape: the favourite envelope stores the **full normalized `Cafe`** object as `snapshot`. This is already how `packages/contracts`' `FavoriteRecordSchema` was implemented in T01 (`snapshot: CafeSchema`) — no contract change was needed. [[Favorite Cafe Model]]'s wording is retained as-is since it is compatible, not wrong.

## OQ-008 — Rating-sort tie-break direction for `userRatingCount`

**Question:** [[Ranking and Filtering Rules]] says rating ties "may use rating count then distance" but does not state whether a higher or lower rating count should win the tie.

**Baseline assumption (implemented in T02):** higher `userRatingCount` wins the tie (descending), on the reasoning that a rating backed by more reviews is more socially validated and should surface first; distance (ascending) is the final tiebreaker. This is a minor UI-ordering detail, not a P0 correctness question — flagged per instruction rather than silently assumed.

**Resolution point:** confirm or override when sort UI is built (T09) if the assumption feels wrong in practice.

## OQ-009 — Task Graph does not show T05 depending on T02 for shared distance calculation

**Question:** [[Data Model]]/`openapi.yaml` require every returned `Cafe` to include `distanceMeters`, which nothing in Bean Stalker's provider (Google Places) supplies directly — it must be computed via the Haversine helper T02 builds. [[Task Graph]]/[[Task Status]] show `T05` depending only on `T01`, not `T02`, even though T05's provider adapter (server-side, `apps/api`) will need the same distance function T02 builds for the frontend (`apps/web`).

**Status:** open; discovered while deciding where to place T02's distance helper. Resolved for T02's own scope by placing `haversineDistanceMeters` in a new shared `packages/domain` package (workspace-consumable by both `apps/web` and `apps/api`) rather than inside `apps/web` alone, precisely so T05 can reuse it without duplicating the formula. Does not block T02, since neither app currently imports `packages/domain` (that wiring belongs to T05/T09/T10).

**Resolution point:** when T05 starts, either add `@bean-stalker/domain` as its dependency and reuse `haversineDistanceMeters`, or make a deliberate, recorded decision to duplicate it — and update [[Task Graph]]'s dependency edges to reflect whichever is chosen.
