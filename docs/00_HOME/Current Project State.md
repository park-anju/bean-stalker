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

**Phase:** T00 (bootstrap), T01 (shared contracts + env validation) and T02 (distance/filter/favourite domain helpers) complete; no cafe-discovery UI/API behaviour implemented yet.

The Bean Stalker vault structure, product baseline, architecture plan, interface contract, test strategy, demo scenario and execution graph are defined. T00 established the pnpm/TypeScript workspace, a placeholder React web shell, a minimal Fastify API, and working quality tooling. T01 turned `packages/contracts` into a real, tested Zod contract package and added fail-fast environment validation to both apps. T02 added a new shared `packages/domain` package with pure, unit-tested distance/sort/filter/favourite functions — not yet wired into either app's runtime.

## What exists now

- governed Obsidian brain with resolvable wiki-links;
- pnpm workspace (`apps/web`, `apps/api`, `packages/contracts`) with shared `tsconfig.base.json`, flat ESLint config and Prettier;
- `apps/web`: Vite + React 19 + TypeScript, React Router with placeholder `/` and `/favorites` routes, TanStack Query provider wired but unused, Vitest + React Testing Library tests;
- `apps/api`: Fastify server with a `/health` endpoint, CORS restricted to `WEB_ORIGIN`, graceful SIGINT/SIGTERM shutdown, Vitest tests via `app.inject`;
- `packages/contracts`: real Zod domain contracts (`LatLng`, `Cafe`, `CafeSearchRequest`/`Response`, `ErrorEnvelope`, `FavoriteStore`) matching `openapi.yaml`/Data Model exactly, plus a shared `formatValidationError` helper — built via a root `postinstall` hook and consumed as a genuine `workspace:*` dependency by both apps;
- fail-fast Zod environment validation: `apps/api/src/env.ts` (`PORT`, `WEB_ORIGIN`, `GOOGLE_PLACES_SERVER_KEY`, `GOOGLE_PLACES_TIMEOUT_MS`) and `apps/web/src/env.ts` (`VITE_API_BASE_URL`, `VITE_GOOGLE_MAPS_BROWSER_KEY`) — verified that the server key never appears in the built browser bundle while the browser key correctly does;
- `packages/domain`: pure, framework-free `Cafe[]` helpers — `haversineDistanceMeters`, `sortCafes` (DISTANCE/RATING), `filterCafes` (minRating/openNow), and `isFavorite`/`addFavorite`/`removeFavorite` operating on `FavoriteStore` — built via the same postinstall/watch pattern as `packages/contracts`, workspace-consumable by both apps but not yet imported by either (that wiring belongs to T05/T09/T10);
- root Playwright e2e config (`tests/e2e/`) with a smoke test against the placeholder shell;
- `pnpm lint`, `pnpm format`, `pnpm typecheck`, `pnpm test` (64 tests across 4 packages), `pnpm build`, `pnpm e2e`, and `pnpm dev` (all four workspace dev processes, with a `predev` hook guaranteeing shared packages are built before the parallel watchers start) all run real tooling and pass;
- git repository initialized; brain baseline, T00 bootstrap, T01 contracts/env, and T02 domain helpers are separate commits;
- deterministic brain validation script (still passing).

## What does not exist yet

- Google Places integration or provider adapter (T05);
- geolocation/manual location resolution (T04);
- cafe search, map, filters, favourites *behaviour* — the pure logic exists (T02) but nothing in `apps/web`/`apps/api` calls it yet (T04–T10);
- an actual `/api/v1` route prefix on the API (see [[Open Questions|OQ-006]]);
- actual Google Maps credentials or billing configuration (local `.env`/`.env.local` files use non-functional placeholders, gitignored);
- deployed app;
- verified live Nearby Search requests;
- screenshots or resume evidence.

## Intended P0 outcome

A user can select a location or grant geolocation, retrieve nearby cafes from live Google Maps Platform data, view results on list/map, filter/sort them, inspect useful details, save favourites locally, and recover cleanly from permission/API failures.

## Next safe action

A review checkpoint is expected before starting the next task. T03 (web shell/routes) and T05 (Fastify search + provider adapter) are both READY; T09/T10 (which will consume T02's domain helpers) remain PENDING until T07 is also DONE. See [[Task Status]].
