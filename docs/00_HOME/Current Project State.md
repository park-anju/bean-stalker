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

**Phase:** T00 (bootstrap), T01 (shared contracts + env validation), T02 (distance/filter/favourite domain helpers) and T03 (responsive React shell/routes) complete; no cafe-discovery, location, search, or map behaviour implemented yet.

The Bean Stalker vault structure, product baseline, architecture plan, interface contract, test strategy, demo scenario and execution graph are defined. T00 established the pnpm/TypeScript workspace, a placeholder React web shell, a minimal Fastify API, and working quality tooling. T01 turned `packages/contracts` into a real, tested Zod contract package and added fail-fast environment validation to both apps. T02 added a new shared `packages/domain` package with pure, unit-tested distance/sort/filter/favourite functions — not yet wired into either app's runtime. T03 replaced the bare T00 placeholder pages with a real responsive application shell: a layout-route `AppShell` (skip link, `Header` with keyboard-accessible `NavLink` navigation, landmark-correct `<header>`/`<nav>`/`<main>`), honest "not yet wired" placeholder copy on `/` and `/favorites`, a `NotFoundPage` for unknown routes, and a small plain-CSS responsive stylesheet — no new dependency introduced.

## What exists now

- governed Obsidian brain with resolvable wiki-links;
- pnpm workspace (`apps/web`, `apps/api`, `packages/contracts`) with shared `tsconfig.base.json`, flat ESLint config and Prettier;
- `apps/web`: Vite + React 19 + TypeScript, React Router with placeholder `/` and `/favorites` routes, TanStack Query provider wired but unused, Vitest + React Testing Library tests;
- `apps/api`: Fastify server with a `/health` endpoint, CORS restricted to `WEB_ORIGIN`, graceful SIGINT/SIGTERM shutdown, Vitest tests via `app.inject`;
- `packages/contracts`: real Zod domain contracts (`LatLng`, `Cafe`, `CafeSearchRequest`/`Response`, `ErrorEnvelope`, `FavoriteStore`) matching `openapi.yaml`/Data Model exactly, plus a shared `formatValidationError` helper — built via a root `postinstall` hook and consumed as a genuine `workspace:*` dependency by both apps;
- fail-fast Zod environment validation: `apps/api/src/env.ts` (`PORT`, `WEB_ORIGIN`, `GOOGLE_PLACES_SERVER_KEY`, `GOOGLE_PLACES_TIMEOUT_MS`) and `apps/web/src/env.ts` (`VITE_API_BASE_URL`, `VITE_GOOGLE_MAPS_BROWSER_KEY`) — verified that the server key never appears in the built browser bundle while the browser key correctly does;
- `packages/domain`: pure, framework-free `Cafe[]` helpers — `haversineDistanceMeters`, `sortCafes` (DISTANCE/RATING), `filterCafes` (minRating/openNow), and `isFavorite`/`addFavorite`/`removeFavorite` operating on `FavoriteStore` — built via the same postinstall/watch pattern as `packages/contracts`, workspace-consumable by both apps but not yet imported by either (that wiring belongs to T05/T09/T10);
- `apps/web/src/components/{AppShell,Header}.tsx`, `routes/{DiscoveryPage,FavoritesPage,NotFoundPage}.tsx`, `styles/app.css`: the T03 shell — responsive (flex-wrap header, max-width container, no fixed desktop widths, verified overflow-free at a 375px mobile viewport), accessible (skip link, semantic landmarks, `aria-current` active nav state distinguished by more than colour, keyboard-operable nav confirmed by test);
- root Playwright e2e config (`tests/e2e/app-shell.spec.ts`, renamed from the T00 bootstrap smoke test) covering shell landmarks, nav round-trip, direct route loads, the not-found route, and mobile viewport sanity;
- `pnpm lint`, `pnpm format`, `pnpm typecheck`, `pnpm test` (71 tests across 4 packages), `pnpm build`, `pnpm e2e`, and `pnpm dev` (all four workspace dev processes, with a `predev` hook guaranteeing shared packages are built before the parallel watchers start) all run real tooling and pass;
- git repository initialized; brain baseline, T00 bootstrap, T01 contracts/env, T02 domain helpers, and T03 shell/routes are separate commits;
- deterministic brain validation script (still passing).

## What does not exist yet

- Google Places integration or provider adapter (T05);
- geolocation/manual location resolution (T04);
- cafe search, map, filters, favourites *behaviour* — the pure logic exists (T02) and the shell to host it exists (T03), but nothing calls it yet (T04–T10);
- an actual `/api/v1` route prefix on the API (see [[Open Questions|OQ-006]]);
- actual Google Maps credentials or billing configuration (local `.env`/`.env.local` files use non-functional placeholders, gitignored);
- deployed app;
- verified live Nearby Search requests;
- screenshots or resume evidence.

## Intended P0 outcome

A user can select a location or grant geolocation, retrieve nearby cafes from live Google Maps Platform data, view results on list/map, filter/sort them, inspect useful details, save favourites locally, and recover cleanly from permission/API failures.

## Next safe action

A review checkpoint is expected before starting the next task. T04 (location resolution), T05 (Fastify search + provider adapter), and T06 (Maps JavaScript integration) are all READY; T09/T10 (which will consume T02's domain helpers) remain PENDING until T07 is also DONE. See [[Task Status]].
