# Bean Stalker Project Intelligence Vault

Bean Stalker is a location-aware cafe discovery application built as a three-day resume project. This repository is intentionally both an implementation workspace and an Obsidian-compatible project brain, following the same governed-note method used by CHARTER.

## Start here

1. Open the **`Bean Stalker/` root folder** as an Obsidian vault.
2. Read `CLAUDE.md` before Claude Code or another coding agent performs substantial work.
3. Open [[Bean Stalker Brain]] and [[Source of Truth Map]].
4. Implementation begins from a task marked `READY` in [[Task Status]].
5. Run `npm run brain:validate` after changing governed documentation.

## Product in one sentence

Bean Stalker helps a user discover nearby cafes from live Google Maps Platform data, inspect them on a map, filter/sort useful results, and save favourites locally without requiring an account.

## Planning stack

- pnpm workspace
- TypeScript end-to-end
- React + Vite web application
- React Router for route boundaries
- TanStack Query for server-state fetching/caching
- Google Maps JavaScript API for map/location UI
- Fastify API boundary for Places web-service calls
- Zod for runtime contract validation
- Browser `localStorage` for MVP favourites
- Vitest + React Testing Library + Playwright

Exact dependency versions are intentionally not claimed until bootstrap locks them.

## Repository zones

- `.claude/` — project-scoped Claude Code execution support.
- `docs/` — canonical project knowledge and Obsidian-linked notes.
- `apps/web/` — React/Vite application after bootstrap.
- `apps/api/` — Fastify API proxy after bootstrap.
- `packages/contracts/` — shared TypeScript/Zod request-response contracts.
- `tests/` — cross-application and end-to-end tests.
- `scripts/` — deterministic brain validation.

## Current status

The Bean Stalker brain is initialized and implementation has **not** been claimed. See [[Current Project State]].
