---
id: DEC-ADR-001
type: decision
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# ADR-001 TypeScript Workspace

**Status:** Accepted

## Decision

Use a TypeScript pnpm workspace.

## Context
The project needs a React frontend, a small server boundary and shared contracts within a three-day build.

## Decision
Use a pnpm workspace with TypeScript across `apps/web`, `apps/api` and `packages/contracts`.

## Consequences
- one language across client/server;
- shared contract types can reduce drift;
- workspace tooling adds small bootstrap cost;
- no microservice split is implied.

Constrains [[System Architecture]], [[SDD]] and T00.
