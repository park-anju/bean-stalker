---
id: ARCH-SYSTEM
type: architecture-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# System Architecture

## P0 baseline

Bean Stalker uses a small TypeScript workspace with a React web client and a Fastify backend boundary for Places web-service calls.

```mermaid
flowchart LR
  U[Browser] --> W[apps/web
React + Vite]
  W --> GJS[Google Maps JavaScript API]
  W --> Q[TanStack Query]
  Q --> A[apps/api
Fastify]
  A --> C[packages/contracts
Zod + TS]
  A --> P[Places Adapter]
  P --> GP[Google Places API New]
  W --> LS[(localStorage
Favourites)]
  C --> W
```

## Frontend modules

- `location` — current/manual search-center acquisition;
- `search` — query inputs and result orchestration;
- `map` — map and marker presentation;
- `cafes` — normalized cafe cards/details;
- `filters` — deterministic local filtering/sorting;
- `favorites` — local persistence;
- `shell` — responsive layout/routes/error boundaries.

## Backend modules

- `health` — process health;
- `cafe-search` — input validation and application service;
- `providers/google-places` — provider request/response adapter;
- `errors` — stable external error mapping;
- `observability` — correlation/logging.

## Dependency direction

```text
UI / HTTP adapters
      ↓
Application orchestration
      ↓
Domain helpers + shared contracts
      ↓
Provider/storage adapters
```

## Cross-cutting controls

- separate browser/server credentials;
- Zod validation at trust boundaries;
- bounded provider request parameters;
- minimal field masks;
- request cancellation/newer-query protection;
- safe logging;
- explicit error states.

See [[Decision Index]].
