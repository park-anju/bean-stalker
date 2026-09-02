---
id: HOME-OPEN-QUESTIONS
type: execution-state
status: approved
version: 1.0
authority: execution
owner: Project Owner
updated: 2026-09-03
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

**Status:** RESOLVED during T09.

**Original question:** [[Ranking and Filtering Rules]] said rating ties "may use rating count then distance" but did not state whether a higher or lower rating count should win the tie.

**Resolution:** T09 built the sort UI and confirmed the T02 assumption as the product decision. [[Ranking and Filtering Rules]] (v1.1, rank-4 canonical owner of sort rules) now states the tie-break explicitly: rating DESC → `userRatingCount` DESC (absent counts as 0) → `distanceMeters` ASC → stable order. Rationale: a rating backed by more reviews is more socially validated; when review counts also tie, the closer cafe wins. No higher-authority source specifies otherwise, so this was a doc clarification, not an ADR. `sortCafes()` already implements it — no code change. Verified by `filterState.test.ts` against the canonical `[4.8/50/100m, 4.8/500/900m, 4.8/500/300m, unrated]` fixture → order `C, B, A, …, unrated last`.

## OQ-009 — Task Graph does not show T05 depending on T02 for shared distance calculation

**Status:** RESOLVED during T05.

**Original question:** [[Data Model]]/`openapi.yaml` require every returned `Cafe` to include `distanceMeters`, which nothing in Bean Stalker's provider (Google Places) supplies directly — it must be computed via the Haversine helper T02 builds. [[Task Graph]]/[[Task Status]] showed `T05` depending only on `T01`, not `T02`, even though T05's provider adapter (server-side, `apps/api`) needs the same distance function T02 built for the frontend (`apps/web`).

**Resolution:** confirmed the dependency is real, not avoidable. `apps/api`'s Google Places adapter imports `haversineDistanceMeters` directly from `@bean-stalker/domain` (already a real, tested, workspace-consumable package since T02) to populate each mapped `Cafe.distanceMeters` — the formula is not duplicated. [[Task Graph]] and [[Task Status]] are updated: `T05` now depends on `T01,T02` (both already `DONE`, so this is a documentation correction, not a new blocker).

## OQ-010 — Manual location mechanism: Google client tooling vs. task boundaries

**Question:** [[Location Resolution]] (T04's own linked canonical doc) says manual location is "a user-selected place/location resolved by **Google Maps client-side location tooling**" (i.e. implies a Google Places Autocomplete-style widget). But T04's actual task scope explicitly excludes all Google Maps/Places dependencies (those belong to T06 — Maps JavaScript integration), and [[Task Graph]]/[[Task Status]] show T04 depending only on T01 and T03, *not* T06 — meaning T04 is meant to be buildable and testable before any Google Maps SDK exists in the app.

**Status:** open; discovered while implementing T04. Resolved for T04's own scope: manual location is implemented as a plain, provider-independent numeric latitude/longitude/optional-label entry form — no Google dependency, no fake geocoding, fully functional today (a user really can produce a working search origin), consistent with [[Location Resolution]]'s own fallback guidance ("If manual text requires future geocoding... prefer an honest intermediate boundary... no fake geography"). It still produces the exact canonical `SearchCenter { latitude, longitude, label? }` shape the doc specifies, so nothing downstream (T05/T07) needs to know which mechanism produced it.

**Resolution point:** still open after T07. T07's canonical scope is search orchestration + result list + cafe-result marker sync; it consumes whatever `SearchCenter` T04 produces and does not own location-input UX. Raw latitude/longitude entry remains the working P0 mechanism. Decide whether to upgrade to a real Google Places Autocomplete/place-picker widget (matching [[Location Resolution]]'s literal wording) or keep coordinate entry as the deliberate permanent P0 mechanism when a dedicated location-UX task next runs — and update [[Location Resolution]]'s wording to match. Do not decide silently. (Note: Places Autocomplete is a billable API and would need its own entry in [[Known Blockers|BLK-003]]'s restriction/quota list.)

## OQ-011 — Fixed search parameters (radius / maxResults / rank / cache TTL) have no canonical values

**Question:** T07 must issue a valid `CafeSearchRequest` but the brain does not specify concrete values. [[Open Questions|OQ-002]] gives a radius baseline (2 km) but nothing fixes `maxResults`, the provider `rankPreference`, or the TanStack Query `staleTime`.

**Baseline assumptions (implemented in T07, in `apps/web/src/search/searchRequest.ts` / `useCafeSearch.ts`):**
- `radiusMeters: 2000` — OQ-002 baseline.
- `maxResults: 10` — conservative within the 1–20 contract bound; keeps provider payloads and the marker set small.
- `rankPreference: 'DISTANCE'` — neutral "nearby" ordering; deterministic; independent of OQ-008's rating tie-break.
- `staleTime: 5 min`, `gcTime: 10 min` — [[Search Result Freshness]]'s "short, on the order of minutes".

**Partially informed by T09:** T09 added local sort/filter controls but deliberately did **not** add a user-facing *search radius* or *provider rank* control (that would change candidate retrieval and is out of T09 scope). It did fix the local‑UX defaults it owns, recorded in `apps/web/src/cafes/filterState.ts`: default filters = `{ minRating: 0, openNowOnly: false, sortBy: 'DISTANCE' }` (hides nothing, preserves T07 order); minimum‑rating choices = Any / 3+ / 3.5+ / 4+ / 4.5+. `rankPreference: 'DISTANCE'` is now doubly reasonable since the default local sort is also distance.

**Still open:** `radiusMeters` (2000), `maxResults` (10), `staleTime`/`gcTime` (5/10 min) remain T07 assumptions. **Resolution point:** confirm or override if/when a radius control is added and when T11 hardens freshness/race behaviour. None is a P0 correctness question.

## OQ-012 — "Favourites only" filter on the Discovery list

**Question:** [[Ranking and Filtering Rules]] lists `favourite: based on local favourite membership` among the filters, and [[Functional Requirements|FR-014]] reads "view/filter favourites". T10 delivered the **view** (a dedicated `/favorites` page) and the favourite membership state, but deliberately did **not** add a "favourites only" toggle to the Discovery `FilterBar`.

**Status:** open; raised while implementing T10. T10's stated scope (persistence boundary + `FavoriteButton` + `FavoritesPage`) did not include a new Discovery filter control, and adding one would touch T09's `FilterBar` and either extend T02's `filterCafes` (which currently only knows `minRating`/`openNow`) or filter by membership in `applyDiscoveryFilters`. FR-014's "view" half is satisfied by `/favorites`.

**Resolution point:** decide during T12 (responsive + accessibility polish) or a dedicated follow-up whether a "favourites only" checkbox on the Discovery list is worth the small `FilterBar`/`filterCafes` change, or whether the dedicated `/favorites` page is a sufficient "filter to favourites" affordance for P0. Do not silently add or drop it.

## OQ-013 — Immediate Retry button on `PROVIDER_CAPACITY_EXHAUSTED`

**Question:** H05's 503 `PROVIDER_CAPACITY_EXHAUSTED` state offers the same explicit **Retry** button as every other retryable error. If exhaustion represents a *monthly/global* allowance, an immediate retry is very unlikely to succeed, so the button could read as misleading.

**Status:** open; non-blocking; raised during H07 review. Current behaviour is deliberate and defensible: the button never auto-retries (the query is `retry: false`), the copy already says "temporarily unavailable — try again later", and the allowance *could* reset (month rollover) or be raised operationally, so a manual retry is not pointless. Changing it would touch H05's `isRetryable`/`SearchStatePanel`.

**H08 review (2026-09-03):** examined during the mobile/accessibility QA pass. Keyboard and screen-reader walkthrough of the 503 state found the current behaviour *acceptable, not harmful*: the alert is announced, focus is not stolen, `retry: false` means no loop, and the copy is honest. The only friction is a mild wording tension ("try again later" beside an immediate "Retry search"). That is a copy/behaviour judgement call with no user-research signal either way, so — per the milestone's instruction not to change H05 solely for this — **OQ-013 stays open.** A future dedicated pass (or T11 failure-state hardening) can decide between (a) dropping the button for `PROVIDER_CAPACITY_EXHAUSTED` and (b) softening the copy.

**Resolution point:** T11 (failure/empty/error/race hardening) or a dedicated follow-up. Do not change H05 solely to resolve this.
