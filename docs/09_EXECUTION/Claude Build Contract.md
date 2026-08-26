---
id: EXEC-CLAUDE-BUILD-CONTRACT
type: execution-state
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Claude Build Contract

## Operating model

Claude Code/Antigravity may accelerate implementation but does not own product semantics. It may propose; it may not silently redefine canonical scope or security boundaries.

## Before a task

1. Confirm task is `READY`.
2. Read the smallest linked canonical context.
3. State expected changes/exclusions.
4. Identify validation/tests before implementation.

## During a task

- make bounded changes;
- preserve TypeScript strictness;
- keep Google provider details behind the provider adapter;
- never leak server credentials into the web app;
- do not disable tests to make CI green;
- avoid speculative abstractions and microservices;
- do not add P1 features while a P0 task is incomplete.

## Forbidden shortcuts

- hardcoded production cafe results presented as live;
- `as any`/blanket type suppression as conflict avoidance;
- wildcard Places field mask in production path;
- server key in `VITE_*` variables;
- infinite/refetch-on-render request loops;
- “open now” inferred from missing data;
- catch-and-return-empty-array on provider failure;
- committing `.env` or credentials.

## Completion response

State:
- what changed;
- what did not change;
- commands run and exact result;
- tests added/run;
- known failures;
- requirements covered;
- next safe task.

Persist this in [[Implementation Handoffs]].
