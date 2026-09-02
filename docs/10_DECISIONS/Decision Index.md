---
id: DECISION-INDEX
type: map-of-content
status: approved
version: 1.0
authority: navigation
owner: Project Owner
updated: 2026-09-03
---
# Decision Index

| ADR | Decision | Status | Constrains |
|---|---|---|---|
| [[ADR-001 TypeScript Workspace]] | TypeScript pnpm workspace | Accepted | repo/tooling |
| [[ADR-002 Google Places Boundary]] | normalize provider behind adapter | Accepted | API/data/tests |
| [[ADR-003 Location Permission]] | manual location is mandatory fallback | Accepted | location/UX |
| [[ADR-004 Favorites Local Storage]] | localStorage favourites for P0 | Accepted | persistence/scope |
| [[ADR-005 Server-Side Places Proxy]] | server-side Places web-service boundary | Accepted | keys/API/deploy |
| [[ADR-006 TanStack Query Server State]] | TanStack Query for search server state | Accepted | web data flow |
| [[ADR-007 Cost-Safe Search Orchestration]] | disable auto-refetch/retry for the billable search query; add fixture-provider mode + Map ID env | Accepted | web data flow, cost, env |
| [[ADR-008 Metered Provider Cost Controls]] | per-client rate limit + global fail-closed usage guard; consume-before-dispatch, no refund on failure; in-memory guard is not a production hard cap; privacy-safe logging | Accepted | API, cost, privacy, env |
| [[ADR-009 API Security Posture]] | credential classification; fail-closed live config; origin validation; frontend build secret gate; strict CORS + minimal explicit security headers + body/request limits + canonical NOT_FOUND; no auth/sessions | Accepted | API, security, env |

## ADR status vocabulary

`Proposed`, `Accepted`, `Superseded`, `Rejected`.

A later ADR names what it supersedes. Old decisions remain for project memory.
