---
id: HOME-CURRENT-PROJECT-STATE
type: execution-state
status: approved
version: 1.0
authority: execution
owner: Project Owner
updated: 2026-08-27
---
# Current Project State

## Verified status

**Phase:** T00 (bootstrap) and T01 (shared contracts + env validation) complete; no cafe-discovery product behaviour implemented.

The Bean Stalker vault structure, product baseline, architecture plan, interface contract, test strategy, demo scenario and execution graph are defined. T00 established the pnpm/TypeScript workspace, a placeholder React web shell, a minimal Fastify API, and working quality tooling. T01 turned `packages/contracts` into a real, tested Zod contract package and added fail-fast environment validation to both apps.

## What exists now

- governed Obsidian brain with resolvable wiki-links;
- pnpm workspace (`apps/web`, `apps/api`, `packages/contracts`) with shared `tsconfig.base.json`, flat ESLint config and Prettier;
- `apps/web`: Vite + React 19 + TypeScript, React Router with placeholder `/` and `/favorites` routes, TanStack Query provider wired but unused, Vitest + React Testing Library tests;
- `apps/api`: Fastify server with a `/health` endpoint, CORS restricted to `WEB_ORIGIN`, graceful SIGINT/SIGTERM shutdown, Vitest tests via `app.inject`;
- `packages/contracts`: real Zod domain contracts (`LatLng`, `Cafe`, `CafeSearchRequest`/`Response`, `ErrorEnvelope`, `FavoriteStore`) matching `openapi.yaml`/Data Model exactly, plus a shared `formatValidationError` helper — built via a root `postinstall` hook and consumed as a genuine `workspace:*` dependency by both apps;
- fail-fast Zod environment validation: `apps/api/src/env.ts` (`PORT`, `WEB_ORIGIN`, `GOOGLE_PLACES_SERVER_KEY`, `GOOGLE_PLACES_TIMEOUT_MS`) and `apps/web/src/env.ts` (`VITE_API_BASE_URL`, `VITE_GOOGLE_MAPS_BROWSER_KEY`) — verified that the server key never appears in the built browser bundle while the browser key correctly does;
- root Playwright e2e config (`tests/e2e/`) with a smoke test against the placeholder shell;
- `pnpm lint`, `pnpm format`, `pnpm typecheck`, `pnpm test` (33 tests across 3 packages), `pnpm build`, `pnpm e2e`, and `pnpm dev` (all three workspace dev processes, including live contracts rebuild) all run real tooling and pass;
- git repository initialized; brain baseline, T00 bootstrap, and T01 contracts/env are separate commits;
- deterministic brain validation script (still passing).

## What does not exist yet

- Google Places integration or provider adapter (T05);
- geolocation/manual location resolution (T04);
- cafe search, map, filters, favourites (T02–T10 behaviour; T02's contracts are ready but its helpers are unimplemented);
- an actual `/api/v1` route prefix on the API (see [[Open Questions|OQ-006]]);
- actual Google Maps credentials or billing configuration (local `.env`/`.env.local` files use non-functional placeholders, gitignored);
- deployed app;
- verified live Nearby Search requests;
- screenshots or resume evidence.

## Intended P0 outcome

A user can select a location or grant geolocation, retrieve nearby cafes from live Google Maps Platform data, view results on list/map, filter/sort them, inspect useful details, save favourites locally, and recover cleanly from permission/API failures.

## Next safe action

A review checkpoint is expected before starting the next task. T02 (domain helpers) and T05 (Fastify search + provider adapter) are both READY; T03 (web shell/routes) remains READY and unstarted. See [[Task Status]].
