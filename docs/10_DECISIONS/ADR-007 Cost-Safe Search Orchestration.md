---
id: DEC-ADR-007
type: decision
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-28
---
# ADR-007 Cost-Safe Search Orchestration

**Status:** Accepted

## Context

Bean Stalker's public portfolio deployment must stay within no-cost third-party
usage under expected portfolio traffic; accidental paid Google Places/Maps usage
is a release blocker (RM0, recorded in [[Non-Functional Requirements|NFR-009]]).
T07 wires the browser to the billable search path (`SearchCenter` → TanStack
Query → `POST /api/v1/cafes/search` → Google Places). TanStack Query's defaults
(refetch on window focus, refetch on reconnect, refetch on mount, `retry: 3`,
`staleTime: 0`) are tuned for free internal APIs and would turn one user search
into several provider requests. [[Search Result Freshness]] and
[[API Cost Guardrail Runbook]] already call for this to be constrained; T07 is
where it becomes code.

Separately, [[Local Development Runbook]] names a **Fixture mode** ("recommended
for routine development/tests, no live provider call") that had no implementation
after T05 — every local search hit Google.

## Decision

1. **The cafe-search query disables every automatic refetch.** For this query
   only: `retry: false`, `refetchOnWindowFocus: false`, `refetchOnReconnect:
   false`, `refetchOnMount: false`, `refetchInterval: false`, a minutes-scale
   `staleTime` (5 min) and `gcTime` (10 min). A request is issued only when the
   query key changes — i.e. the user commits a new `SearchCenter`. Retry is a
   visible, explicit button that issues exactly one more request.
2. **The query key is `['cafes','search', lat, lng, radius, maxResults, rank]`** —
   derived only from the validated request parameters, coordinates unrounded, so
   semantically identical searches share one cache entry.
3. **`apps/api` gains a `CAFE_PROVIDER` switch (`live` | `fixture`).**
   `FixtureCafeProvider` serves the committed Google-shaped fixture through the
   *same* schema + `mapGooglePlaceToCafe` normalization as the live provider.
   `live` is the default; `fixture` is dev/test only and never valid in
   production. `GooglePlacesProvider` is unchanged.
4. **Advanced Markers require a Map ID**, so T07 introduces the required
   browser env var `VITE_GOOGLE_MAPS_MAP_ID` (`DEMO_MAP_ID` for local/test; a
   real Cloud-configured, referrer-restricted Map ID for a deployed build).

## Alternatives considered

- *Keep TanStack Query defaults and rely on `staleTime` alone* — rejected:
  focus/reconnect/mount refetches still fire once stale, and `retry: 3` still
  triples a hard failure.
- *A bounded automatic retry (`retry: 1`)* — rejected for a billable query; a
  retry the user cannot see is exactly the amplification RM0 forbids.
- *No fixture provider; verify only against mocked clients / `page.route`* —
  rejected: [[Local Development Runbook]] already mandates Fixture mode, and
  honest `pnpm dev` verification ("real Bean Stalker API with fake provider")
  needs it.
- *Reuse the browser Maps key as the Map ID / skip the Map ID* — rejected:
  a Map ID is a distinct Cloud resource that Advanced Markers require.

## Consequences

- One committed search = at most one provider request; rerender / focus /
  reconnect / remount / map pan / marker or card selection never issue one
  (test-enforced in `useCafeSearch.test.tsx` and `search.spec.ts`).
- A stale cached result for an unchanged search center is reused for 5 minutes
  rather than refetched.
- Local dev and CI run entirely offline against fixtures; live Google remains a
  later, deliberate milestone (T08).
- `.env.example` / [[Environment Contract]] gain `VITE_GOOGLE_MAPS_MAP_ID` and
  `CAFE_PROVIDER`.
- Public deployment stays blocked until server-side abuse controls + Cloud
  quotas + restricted keys exist ([[Known Blockers|BLK-003]]).

Constrains [[Search Result Freshness]], [[SDD]], [[Environment Contract]],
[[API Cost Guardrail Runbook]] and T07–T08. Builds on
[[ADR-006 TanStack Query Server State]].
