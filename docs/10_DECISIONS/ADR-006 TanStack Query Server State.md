---
id: DEC-ADR-006
type: decision
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# ADR-006 TanStack Query Server State

**Status:** Accepted

## Decision

Use TanStack Query for cafe search server state.

## Context
Search has loading/error/cache/refetch/race semantics that are awkward to implement repeatedly with ad-hoc React effects.

## Decision
Use TanStack Query for API server state; keep filters/selection/favourites in appropriate local state.

## Consequences
- declarative request lifecycle/caching;
- query-key design becomes important for cost/race control;
- avoids storing fetched server state in global client stores.

Constrains [[Search Result Freshness]], [[SDD]] and T07.
