---
id: EXEC-TASK-STATUS
type: execution-state
status: approved
version: 1.0
authority: execution
owner: Project Owner
updated: 2026-08-28
---
# Task Status

Status vocabulary: `PENDING`, `READY`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

| ID | Task | Depends on | Status | Canonical context |
|---|---|---|---|---|
| T00 | Bootstrap pnpm/TS/Vite/Fastify/test tooling | — | DONE | [[System Architecture]], [[Local Development Runbook]] |
| T01 | Shared Zod contracts + env validation | T00 | DONE | [[Data Model]], [[API Key Boundaries]], [[API Contract]] |
| T02 | Distance/filter/favourite domain helpers | T01 | DONE | [[Ranking and Filtering Rules]], [[Favorite Cafe Model]] |
| T03 | Responsive React shell/routes | T00 | DONE | [[Screen Inventory]], [[UX Contract]] |
| T04 | Current + manual location resolution | T01,T03 | DONE | [[Location Resolution]], [[Privacy Boundaries]] |
| T05 | Fastify cafe search + Google provider adapter | T01,T02 | DONE | [[API Contract]], [[External Service Constraints]], [[ADR-005 Server-Side Places Proxy]] |
| T06 | Maps JavaScript map integration | T03 | DONE | [[System Architecture]], [[API Key Boundaries]] |
| T07 | Search orchestration/list/marker sync | T04,T05,T06 | DONE | [[Search Lifecycle]], [[UX Contract]], [[ADR-007 Cost-Safe Search Orchestration]] |
| T08 | Restricted-credential live provider smoke | T07 | BLOCKED | [[API Key Boundaries]], [[API Cost Guardrail Runbook]] |
| T09 | Local sort/filter controls | T02,T07 | DONE | [[Ranking and Filtering Rules]] |
| T10 | localStorage favourites | T02,T07 | DONE | [[Favorite Cafe Model]], [[ADR-004 Favorites Local Storage]] |
| T11 | loading/empty/error/race hardening | T08 | PENDING | [[Search Lifecycle]], [[Error Catalog]] |
| T12 | responsive + accessibility polish | T09,T10,T11 | PENDING | [[UX Contract]], [[Non-Functional Requirements]] |
| T13 | unit/component/API/e2e verification | T11,T12 | PENDING | [[Test Strategy]], [[Test Case Catalog]] |
| T14 | deploy with safe env/key restrictions | T13 | PENDING | [[Production Deployment Runbook]], [[Threat Model]] |
| T15 | README/screenshots/demo/resume evidence | T14 | PENDING | [[Golden Demo Scenario]], [[Release Readiness]] |


## Notes

- With `T09` and `T10` `DONE`, **no task is currently `READY`**. Every remaining task (`T11`–`T15`) sits behind `T08`.
- `T08` is `BLOCKED` on [[Known Blockers|BLK-001]] (real restricted Google credentials) and [[Known Blockers|BLK-003]]; its dependency `T07` is `DONE`. It is the gate for the rest of the graph.
- `T11` needs `T08`; `T12` needs `T09` + `T10` + `T11`; `T13`–`T15` follow. All `PENDING` until the developer configures Google credentials/quotas.
- Ordinary MVP feature implementation is complete after T10 ([[MVP Scope]] P0 feature set); what remains is a live smoke, failure/race hardening, polish, verification, deploy and demo packaging.
- One minor deferred item is tracked as [[Open Questions|OQ-012]] (a "favourites only" filter on the Discovery list).

## Update rule

- exactly one task should be `IN_PROGRESS` per focused executor unless intentionally parallelized;
- dependencies must be `DONE` before `READY`;
- a blocked external credential task can be delayed while independent work continues;
- `DONE` requires [[Definition of Done]].
