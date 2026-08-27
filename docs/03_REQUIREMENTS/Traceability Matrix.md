---
id: REQ-TRACEABILITY
type: requirements-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Traceability Matrix

| Requirement | Domain/design | Test target | P0 status |
|---|---|---|---|
| FR-001/002 | [[Location Resolution]] | TC-LOC-001..004 | VERIFIED — T04: TC-LOC-001 (granted geolocation → valid `SearchCenter`, unit + e2e with mocked browser coordinates), TC-LOC-002 (denied permission → manual form remains usable, unit + e2e), TC-LOC-003 (unavailable/timeout mapped to a handled error state, never a crash, unit), TC-LOC-004 (invalid manual coordinates rejected via `SearchCenterSchema` before ever reaching a resolved state, unit + component). See [[Implementation Handoffs]] for exact evidence. |
| FR-003/004 | [[Search Lifecycle]], [[API Contract]] | TC-SEARCH-001..006 | PLANNED — unit/route evidence exists for TC-SEARCH-001/002/004/005/006 (`apps/api`, T05: normalized response, empty-success, server-bounded radius/results, provider-failure mapping, minimal field mask); TC-SEARCH-003 (stale-response race) is a frontend orchestration concern, not yet built (T07) |
| FR-005/006 | [[UX Contract]] | TC-UI-001..003 | PLANNED |
| FR-007 | [[Cafe Discovery Model]] | TC-MAP-001..003 | VERIFIED — T05: TC-MAP-001 (Google fields normalize to `Cafe`), TC-MAP-002 (missing optional fields stay absent/UNKNOWN, never fabricated), TC-MAP-003 (distance delegates to T02's tolerance-tested Haversine helper), all unit-tested against realistic fixtures. |
| FR-008..011 | [[Ranking and Filtering Rules]] | TC-FILTER-001..005 | PLANNED — unit evidence exists for TC-FILTER-001/002/003/005 (`packages/domain`, T02); TC-FILTER-004 (reset) and UI wiring are not yet built |
| FR-012..014 | [[Favorite Cafe Model]] | TC-FAV-001..004 | PLANNED — unit evidence exists for TC-FAV-001/002 (`packages/domain`, T02); TC-FAV-003/004 require T10's localStorage persistence |
| FR-015/016 | [[Search Lifecycle]], [[Error Catalog]] | TC-ERR-001..005 | PLANNED |
| FR-017 | [[Cafe Discovery Model]] | TC-UI-004 | PLANNED |
| FR-018 | [[Business Rules]], [[API Contract]] | TC-API-001..004 | VERIFIED — T05: all four route-tested (invalid params/missing field/unknown field rejected before the provider is ever called; malformed body still returns the stable envelope). |
| FR-019 | [[API Contract]] | TC-API-005 | VERIFIED — T05: `/health` returns `{"status":"ok"}` with no secret exposure (existing test + manual curl + code inspection of the route). |
| NFR-001/002 | [[Threat Model]], [[Privacy Boundaries]] | TC-SEC-001..004 | PLANNED — evidence exists for TC-SEC-001 (server key absent from browser bundle, T01/T04/T05 regression-checked), TC-SEC-002 (provider errors never echo Google's raw body or the API key, T05 unit test), TC-SEC-003 (malformed/oversized input rejected safely, T05 route tests); TC-SEC-004 (favourite storage) requires T10 |
| NFR-003/009 | [[Performance Test Plan]], [[API Cost Guardrail Runbook]] | PERF-001..003 | PLANNED |
| NFR-004/005 | [[UX Contract]] | TC-A11Y-001..003 | PLANNED — evidence exists for the shell/nav portion of TC-A11Y-001 (keyboard operable) and for NFR-005 responsive behaviour (`apps/web`, T03: unit + e2e, including a mobile no-overflow check). T06 added a real `CafeMap` (map surface + accessible loading/no-center/error status text, verified at 375px and desktop without horizontal overflow, unit + e2e) but it renders no cafe data — TC-A11Y-002 still requires favourite controls (T10, not built) and TC-A11Y-003 ("map-only information has list equivalent") is inapplicable until cafe results exist on the map at all (T07), so neither is evidenced yet. |
| NFR-006..008 | [[Test Strategy]], [[Observability Runbook]] | TC-ERR/OPS | PLANNED |


## Evidence rule

`PLANNED` may become `VERIFIED` only when the exact test/build/manual evidence is recorded in [[Implementation Handoffs]]. Documentation existence alone is not implementation evidence.
