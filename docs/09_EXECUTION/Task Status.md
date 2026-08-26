---
id: EXEC-TASK-STATUS
type: execution-state
status: approved
version: 1.0
authority: execution
owner: Project Owner
updated: 2026-08-27
---
# Task Status

Status vocabulary: `PENDING`, `READY`, `IN_PROGRESS`, `BLOCKED`, `DONE`.

| ID | Task | Depends on | Status | Canonical context |
|---|---|---|---|---|
| T00 | Bootstrap pnpm/TS/Vite/Fastify/test tooling | — | READY | [[System Architecture]], [[Local Development Runbook]] |
| T01 | Shared Zod contracts + env validation | T00 | PENDING | [[Data Model]], [[API Key Boundaries]], [[API Contract]] |
| T02 | Distance/filter/favourite domain helpers | T01 | PENDING | [[Ranking and Filtering Rules]], [[Favorite Cafe Model]] |
| T03 | Responsive React shell/routes | T00 | PENDING | [[Screen Inventory]], [[UX Contract]] |
| T04 | Current + manual location resolution | T01,T03 | PENDING | [[Location Resolution]], [[Privacy Boundaries]] |
| T05 | Fastify cafe search + Google provider adapter | T01 | PENDING | [[API Contract]], [[External Service Constraints]], [[ADR-005 Server-Side Places Proxy]] |
| T06 | Maps JavaScript map integration | T03 | PENDING | [[System Architecture]], [[API Key Boundaries]] |
| T07 | Search orchestration/list/marker sync | T04,T05,T06 | PENDING | [[Search Lifecycle]], [[UX Contract]] |
| T08 | Restricted-credential live provider smoke | T07 | PENDING | [[API Key Boundaries]], [[API Cost Guardrail Runbook]] |
| T09 | Local sort/filter controls | T02,T07 | PENDING | [[Ranking and Filtering Rules]] |
| T10 | localStorage favourites | T02,T07 | PENDING | [[Favorite Cafe Model]], [[ADR-004 Favorites Local Storage]] |
| T11 | loading/empty/error/race hardening | T08 | PENDING | [[Search Lifecycle]], [[Error Catalog]] |
| T12 | responsive + accessibility polish | T09,T10,T11 | PENDING | [[UX Contract]], [[Non-Functional Requirements]] |
| T13 | unit/component/API/e2e verification | T11,T12 | PENDING | [[Test Strategy]], [[Test Case Catalog]] |
| T14 | deploy with safe env/key restrictions | T13 | PENDING | [[Production Deployment Runbook]], [[Threat Model]] |
| T15 | README/screenshots/demo/resume evidence | T14 | PENDING | [[Golden Demo Scenario]], [[Release Readiness]] |


## Update rule

- exactly one task should be `IN_PROGRESS` per focused executor unless intentionally parallelized;
- dependencies must be `DONE` before `READY`;
- a blocked external credential task can be delayed while independent work continues;
- `DONE` requires [[Definition of Done]].
