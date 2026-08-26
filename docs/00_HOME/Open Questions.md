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
