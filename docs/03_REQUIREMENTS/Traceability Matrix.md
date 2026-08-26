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
| FR-001/002 | [[Location Resolution]] | TC-LOC-001..004 | PLANNED |
| FR-003/004 | [[Search Lifecycle]], [[API Contract]] | TC-SEARCH-001..006 | PLANNED |
| FR-005/006 | [[UX Contract]] | TC-UI-001..003 | PLANNED |
| FR-007 | [[Cafe Discovery Model]] | TC-MAP-001..003 | PLANNED |
| FR-008..011 | [[Ranking and Filtering Rules]] | TC-FILTER-001..005 | PLANNED — unit evidence exists for TC-FILTER-001/002/003/005 (`packages/domain`, T02); TC-FILTER-004 (reset) and UI wiring are not yet built |
| FR-012..014 | [[Favorite Cafe Model]] | TC-FAV-001..004 | PLANNED — unit evidence exists for TC-FAV-001/002 (`packages/domain`, T02); TC-FAV-003/004 require T10's localStorage persistence |
| FR-015/016 | [[Search Lifecycle]], [[Error Catalog]] | TC-ERR-001..005 | PLANNED |
| FR-017 | [[Cafe Discovery Model]] | TC-UI-004 | PLANNED |
| FR-018 | [[Business Rules]], [[API Contract]] | TC-API-001..004 | PLANNED |
| FR-019 | [[API Contract]] | TC-API-005 | PLANNED |
| NFR-001/002 | [[Threat Model]], [[Privacy Boundaries]] | TC-SEC-001..004 | PLANNED |
| NFR-003/009 | [[Performance Test Plan]], [[API Cost Guardrail Runbook]] | PERF-001..003 | PLANNED |
| NFR-004/005 | [[UX Contract]] | TC-A11Y-001..003 | PLANNED — evidence exists for the shell/nav portion of TC-A11Y-001 (keyboard operable) and for NFR-005 responsive behaviour (`apps/web`, T03: unit + e2e, including a mobile no-overflow check); TC-A11Y-002/003 require favourite controls and a map, neither of which exist yet |
| NFR-006..008 | [[Test Strategy]], [[Observability Runbook]] | TC-ERR/OPS | PLANNED |


## Evidence rule

`PLANNED` may become `VERIFIED` only when the exact test/build/manual evidence is recorded in [[Implementation Handoffs]]. Documentation existence alone is not implementation evidence.
