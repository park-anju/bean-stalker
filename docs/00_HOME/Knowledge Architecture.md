---
id: HOME-KNOWLEDGE-ARCHITECTURE
type: governance
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Knowledge Architecture

## Layers

```mermaid
flowchart TD
  B[Business Truth] --> D[Domain Truth]
  D --> R[Requirements & Boundaries]
  R --> A[Architecture & Interfaces]
  A --> Q[Verification]
  Q --> E[Execution Evidence]
  E --> S[Current Project State]
  S -. feedback .-> B
```

## Note classes

- **canonical** — owns a concern and resolves conflicts within its jurisdiction.
- **derived** — summarizes canonical truth and links upstream.
- **execution-state** — records verified current reality.
- **decision** — ADR with context, decision and consequences.
- **catalog** — stable identifiers for errors, tests and telemetry.
- **map-of-content** — navigation only.
- **session** — temporal memory; evidence source, not specification authority.

## Retrieval principle

Use the smallest sufficient context path:

`active task → requirement → domain rule → security/external boundary → design/interface → acceptance evidence`

See [[Linking Rules]], [[Metadata Schema]] and [[Source of Truth Map]].
