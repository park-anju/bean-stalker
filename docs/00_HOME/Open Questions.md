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

**Status:** RESOLVED during T05.

**Original question:** `openapi.yaml` and [[API Contract]] specified `GET /api/v1/health`, but T00's `apps/api` implementation registered a bare `GET /health` with no route prefix or version segment.

**Resolution:** `/health` deliberately stays unprefixed/unversioned. It is a process-level liveness/infra check (used by orchestration/uptime tooling, not application clients), and such checks conventionally sit outside API versioning so they remain stable across API version changes. The new `/api/v1` prefix is reserved for versioned business routes, starting with `POST /api/v1/cafes/search`. `openapi.yaml` and [[API Contract]] are updated to document `GET /health` (unprefixed) to match reality — this is a documentation correction reflecting a deliberate decision, not documentation drift left unaddressed.

## OQ-007 — Favourite snapshot shape: full `Cafe` vs compact display fields

**Status:** RESOLVED during T02.

**Original question:** [[Data Model]] (rank 8, system design) literally types the favourite envelope's `snapshot` field as the full `Cafe` interface. [[Favorite Cafe Model]] (rank 4, domain semantics) instead describes "a compact display snapshot: name, address, coordinates, rating/open status if known at save time," which reads like a narrower shape than `Cafe`.

**Resolution:** not actually a conflict once each document's precedence is applied to the right subject matter. Per [[Source of Truth Map]], domain semantics (rank 4) owns "meaning and invariants," while system design (rank 8) owns "components and data" — i.e. the *exact stored shape*. [[Favorite Cafe Model]]'s "compact display snapshot" phrase, especially its qualifier "if known at save time" (which mirrors `Cafe`'s own optional fields), reads as an informal description of which fields a UI will typically *show* from the snapshot, not a competing formal schema. [[Data Model]] remains authoritative for the literal shape: the favourite envelope stores the **full normalized `Cafe`** object as `snapshot`. This is already how `packages/contracts`' `FavoriteRecordSchema` was implemented in T01 (`snapshot: CafeSchema`) — no contract change was needed. [[Favorite Cafe Model]]'s wording is retained as-is since it is compatible, not wrong.

## OQ-008 — Rating-sort tie-break direction for `userRatingCount`

**Question:** [[Ranking and Filtering Rules]] says rating ties "may use rating count then distance" but does not state whether a higher or lower rating count should win the tie.

**Baseline assumption (implemented in T02):** higher `userRatingCount` wins the tie (descending), on the reasoning that a rating backed by more reviews is more socially validated and should surface first; distance (ascending) is the final tiebreaker. This is a minor UI-ordering detail, not a P0 correctness question — flagged per instruction rather than silently assumed.

**Resolution point:** confirm or override when sort UI is built (T09) if the assumption feels wrong in practice.

## OQ-009 — Task Graph does not show T05 depending on T02 for shared distance calculation

**Status:** RESOLVED during T05.

**Original question:** [[Data Model]]/`openapi.yaml` require every returned `Cafe` to include `distanceMeters`, which nothing in Bean Stalker's provider (Google Places) supplies directly — it must be computed via the Haversine helper T02 builds. [[Task Graph]]/[[Task Status]] showed `T05` depending only on `T01`, not `T02`, even though T05's provider adapter (server-side, `apps/api`) needs the same distance function T02 built for the frontend (`apps/web`).

**Resolution:** confirmed the dependency is real, not avoidable. `apps/api`'s Google Places adapter imports `haversineDistanceMeters` directly from `@bean-stalker/domain` (already a real, tested, workspace-consumable package since T02) to populate each mapped `Cafe.distanceMeters` — the formula is not duplicated. [[Task Graph]] and [[Task Status]] are updated: `T05` now depends on `T01,T02` (both already `DONE`, so this is a documentation correction, not a new blocker).

## OQ-010 — Manual location mechanism: Google client tooling vs. task boundaries

**Question:** [[Location Resolution]] (T04's own linked canonical doc) says manual location is "a user-selected place/location resolved by **Google Maps client-side location tooling**" (i.e. implies a Google Places Autocomplete-style widget). But T04's actual task scope explicitly excludes all Google Maps/Places dependencies (those belong to T06 — Maps JavaScript integration), and [[Task Graph]]/[[Task Status]] show T04 depending only on T01 and T03, *not* T06 — meaning T04 is meant to be buildable and testable before any Google Maps SDK exists in the app.

**Status:** open; discovered while implementing T04. Resolved for T04's own scope: manual location is implemented as a plain, provider-independent numeric latitude/longitude/optional-label entry form — no Google dependency, no fake geocoding, fully functional today (a user really can produce a working search origin), consistent with [[Location Resolution]]'s own fallback guidance ("If manual text requires future geocoding... prefer an honest intermediate boundary... no fake geography"). It still produces the exact canonical `SearchCenter { latitude, longitude, label? }` shape the doc specifies, so nothing downstream (T05/T07) needs to know which mechanism produced it.

**Resolution point:** when T06 (Maps JavaScript integration) exists, decide whether to upgrade manual entry to a real Google Places Autocomplete/place-picker widget (matching [[Location Resolution]]'s literal wording) or to keep raw coordinate entry as the deliberate, permanent P0 mechanism and update [[Location Resolution]]'s wording to match reality. Do not decide silently — record whichever is chosen.
