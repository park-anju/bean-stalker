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

**Phase:** T00 (bootstrap), T01 (shared contracts + env validation), T02 (distance/filter/favourite domain helpers), T03 (responsive React shell/routes), T04 (current + manual location resolution), T05 (Fastify cafe search + Google provider adapter), and T06 (Google Maps JavaScript map integration) complete; no frontend search orchestration, filter/sort UI, or favourite persistence implemented yet.

The Bean Stalker vault structure, product baseline, architecture plan, interface contract, test strategy, demo scenario and execution graph are defined. T00 established the pnpm/TypeScript workspace, a placeholder React web shell, a minimal Fastify API, and working quality tooling. T01 turned `packages/contracts` into a real, tested Zod contract package and added fail-fast environment validation to both apps. T02 added a new shared `packages/domain` package with pure, unit-tested distance/sort/filter/favourite functions. T03 replaced the bare T00 placeholder pages with a real responsive application shell. T04 made the Discovery page capable of resolving an actual, usable search origin (current-location + manual lat/lng, backed by a `SearchCenterSchema` in `packages/contracts`). T05 gave `apps/api` a real, working cafe-search endpoint: `POST /api/v1/cafes/search` validates the request via T01's `CafeSearchRequestSchema`, delegates to a `GooglePlacesProvider` (Google Places API New `searchNearby`, minimal field mask, injectable-fetch for testability) that maps Google's raw response to Bean Stalker's `Cafe` contract and computes `distanceMeters` by reusing T02's `haversineDistanceMeters` (no duplicate formula), and maps provider/network failures to the Error Catalog's stable envelope. Never calls Google with an invalid request; never leaks the server key or raw provider payloads. T06 added a `CafeMap` component (`apps/web/src/map/`) that loads the Google Maps JavaScript API via a hand-written, dedicated loader (`googleMapsLoader.ts`, using the current `loading=async&callback=` script pattern and `google.maps.importLibrary('maps')` — not the deprecated synchronous bootstrap, not a third-party React wrapper), centers a real `google.maps.Map` on the same resolved `SearchCenter` that `LocationSelector` displays (the two now share one `useLocation()` instance lifted up to `DiscoveryPage`), re-centers via `setCenter` on location change rather than recreating the map, and renders accessible loading/no-center/error status text instead of raw Google errors or a crash. It implements no markers, no cafe fetching, and no filter/sort UI — that is explicitly T07's scope. It uses only the browser-visible `VITE_GOOGLE_MAPS_BROWSER_KEY`, never the server key.

## What exists now

- governed Obsidian brain with resolvable wiki-links;
- pnpm workspace (`apps/web`, `apps/api`, `packages/contracts`) with shared `tsconfig.base.json`, flat ESLint config and Prettier;
- `apps/web`: Vite + React 19 + TypeScript, React Router with placeholder `/` and `/favorites` routes, TanStack Query provider wired but unused, Vitest + React Testing Library tests;
- `apps/api`: Fastify server with a `/health` endpoint (deliberately unprefixed/unversioned — see [[Open Questions|OQ-006]]), `POST /api/v1/cafes/search` (new, T05), CORS restricted to `WEB_ORIGIN`, a global error handler normalizing even body-parse failures into the Bean Stalker envelope, graceful SIGINT/SIGTERM shutdown, Vitest tests via `app.inject`;
- `apps/api/src/providers/google-places/`: `GooglePlacesProvider` (Google Places API New `searchNearby`, minimal 10-field mask, `AbortSignal.timeout`-bounded, injectable `fetchImpl`), private non-strict Google response schemas, and a pure `mapGooglePlaceToCafe` mapper reusing `haversineDistanceMeters` from `packages/domain` — provider/network failures become a small `ProviderError` mapped to `ErrorCode`/HTTP status at the route boundary;
- `packages/contracts`: real Zod domain contracts (`LatLng`, `SearchCenter`, `Cafe`, `CafeSearchRequest`/`Response`, `ErrorEnvelope`, `FavoriteStore`) matching `openapi.yaml`/Data Model exactly, plus a shared `formatValidationError` helper — built via a root `postinstall` hook and consumed as a genuine `workspace:*` dependency by all apps/packages that need it;
- fail-fast Zod environment validation: `apps/api/src/env.ts` (`PORT`, `WEB_ORIGIN`, `GOOGLE_PLACES_SERVER_KEY`, `GOOGLE_PLACES_TIMEOUT_MS`) and `apps/web/src/env.ts` (`VITE_API_BASE_URL`, `VITE_GOOGLE_MAPS_BROWSER_KEY`) — verified that the server key never appears in the built browser bundle while the browser key correctly does;
- `packages/domain`: pure, framework-free `Cafe[]` helpers — `haversineDistanceMeters`, `sortCafes` (DISTANCE/RATING), `filterCafes` (minRating/openNow), and `isFavorite`/`addFavorite`/`removeFavorite` operating on `FavoriteStore` — now a real dependency of `apps/api` (T05) in addition to being workspace-consumable by `apps/web` (still unwired there — T09/T10's job);
- `apps/web/src/components/{AppShell,Header}.tsx`, `routes/{DiscoveryPage,FavoritesPage,NotFoundPage}.tsx`, `styles/app.css`: the T03 shell — responsive (flex-wrap header, max-width container, no fixed desktop widths, verified overflow-free at a 375px mobile viewport), accessible (skip link, semantic landmarks, `aria-current` active nav state distinguished by more than colour, keyboard-operable nav confirmed by test);
- `apps/web/src/location/`: `SearchCenterSchema`-typed location state machine — `locationState.ts` (discriminated-union `LocationState`, pure reducer, reusing `ErrorCode` from contracts for error reasons rather than inventing a parallel taxonomy), `geolocationErrors.ts` (pure browser-error mapper), `browserGeolocation.ts` (the one place `navigator.geolocation` is touched, with an injectable adapter interface), `useLocation.ts` (the hook), `LocationSelector`/`ManualLocationForm` (UI, wired into `DiscoveryPage`) — current-location failures never block the always-available manual form, verified by both unit and e2e tests (including a real Playwright browser context with denied/granted geolocation permissions);
- `tests/fixtures/nearby-cafes-{happy,empty,malformed}.json`: Google-shaped raw response fixtures (planned since the brain's Seed Data Catalog, first created in T05) used by the mapper/provider tests;
- `apps/web/src/map/`: `googleMapsLoader.ts` (promise-deduplicated script loader, `@types/google.maps` devDependency for typing, no runtime third-party Maps wrapper) and `CafeMap.tsx` (own DOM container, a discriminated `MapLifecycle`, `hidden`-attribute container toggling instead of destroy/recreate, `role="status"`/`aria-label`-disambiguated accessible status text, no markers/fetching/filtering) — both loader and component are unit-tested against a mocked `google.maps` global, never a live/billable Google call;
- root Playwright e2e config: `tests/e2e/app-shell.spec.ts` (shell landmarks, nav round-trip, direct route loads, not-found route, mobile viewport sanity) and `tests/e2e/location.spec.ts` (granted/denied geolocation, manual flow, mobile viewport, T03 regression — status-region assertions now disambiguated by accessible name since `CafeMap` introduced a second `role="status"` region on the page);
- `pnpm lint`, `pnpm format`, `pnpm typecheck`, `pnpm test` (142 tests across 4 packages), `pnpm build`, `pnpm e2e` (10 tests), and `pnpm dev` (all four workspace dev processes, with a `predev` hook guaranteeing shared packages are built before the parallel watchers start) all run real tooling and pass;
- git repository initialized; brain baseline, T00 bootstrap, T01 contracts/env, T02 domain helpers, T03 shell/routes, T04 location resolution, T05 cafe search, and T06 map integration are separate commits;
- deterministic brain validation script (still passing).

## What does not exist yet

- cafe markers, map/list result sync, and any orchestration between the search endpoint and the map or a results list — `CafeMap` renders an empty base map only; that data-driven behaviour is T07's canonical scope;
- frontend search orchestration, filters/sort UI, favourites *behaviour* — the backend can now serve real searches (T05) and the pure domain logic exists (T02), but nothing in `apps/web` calls the search endpoint yet (T07–T10);
- actual production Google Maps/Places credentials or billing configuration (local `.env`/`.env.local` files use non-functional placeholders, gitignored). A real network smoke test of the Maps JS loader *was* run against Google's live infrastructure in this sandbox and reached the `ready` state (the placeholder browser key was not rejected outright — Google's JS API tolerates an invalid key for basic map display, showing its own "for development purposes only" watermark, rather than failing the script load), so the loader/component pipeline is confirmed working end-to-end against real Google servers. This does **not** verify referrer/API-key restriction configuration, which requires an actual restricted production key — that remains unverified, same as T05's live Places smoke test;
- deployed app;
- verified live Nearby Search requests;
- screenshots or resume evidence.

## Intended P0 outcome

A user can select a location or grant geolocation, retrieve nearby cafes from live Google Maps Platform data, view results on list/map, filter/sort them, inspect useful details, save favourites locally, and recover cleanly from permission/API failures.

## Next safe action

A review checkpoint is expected before starting the next task. T07 (search orchestration/list/marker sync) is READY (`T04`, `T05`, `T06` are all DONE) but has not been started — the executor stopped after T06 as explicitly instructed. See [[Task Status]].
