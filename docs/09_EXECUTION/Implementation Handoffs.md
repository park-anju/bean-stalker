---
id: EXEC-HANDOFFS
type: execution-state
status: approved
version: 1.0
authority: execution
owner: Project Owner
updated: 2026-08-28
---
# Implementation Handoffs

## Purpose

Append verified evidence between implementation tasks/sessions. Do not replace history with optimistic summaries.

## Handoff template

### `<TASK-ID>` — `<title>`

- **Date:**
- **Executor:**
- **Starting commit:**
- **Ending commit:**
- **Requirements:**
- **Changed:**
- **Explicitly not changed:**
- **Commands run:**

| Command | Exact result |
|---|---|
| `...` | ... |

- **Tests added/run:**
- **Known failures:**
- **Security/provider review:**
- **Next safe task:**

---

## Baseline handoff — brain initialization

- **Date:** 2026-08-27
- **Changed:** created governed Bean Stalker project brain, contracts/specifications, task graph, ADR baseline, quality plan and Claude execution support.
- **Not changed:** no product source code implemented; no live credentials configured; no deployment claimed.
- **Validation:** see package validation record after ZIP generation.
- **Next safe task:** T00.

---

### `T00` — Bootstrap pnpm/TS/Vite/Fastify/test tooling

- **Date:** 2026-08-27
- **Executor:** Claude Code
- **Starting commit:** `8c8461a` (Initialize Bean Stalker project brain vault)
- **Ending commit:** `64e98da` (Bootstrap T00: pnpm/TS/Vite/Fastify/test workspace)
- **Requirements:** none from [[Traceability Matrix]] — T00 is infrastructure bootstrap, not product behaviour. No traceability rows changed.
- **Changed:**
  - root: `package.json` (real `dev`/`lint`/`format`/`typecheck`/`test`/`build`/`e2e` scripts), `tsconfig.base.json`, `eslint.config.js` (flat config), `.prettierrc.json`/`.prettierignore` (scoped away from `docs/`, `.claude/`, `.obsidian/`, `CLAUDE.md`, `README.md` to preserve governed brain formatting), `.nvmrc`, `pnpm-workspace.yaml` (`onlyBuiltDependencies: [esbuild]`), `pnpm-lock.yaml`.
  - `apps/web`: Vite + React 19 + TypeScript scaffold, React Router with placeholder `/` and `/favorites` routes, TanStack Query provider wired (unused), Vitest + React Testing Library smoke test, `.env.example`.
  - `apps/api`: Fastify scaffold with `/health` endpoint, `@fastify/cors` restricted to `WEB_ORIGIN`, graceful SIGINT/SIGTERM shutdown, Vitest test via `app.inject`, `.env.example`. Uses `NodeNext` module resolution (server runs directly under Node, unlike the Vite-bundled web app).
  - `packages/contracts`: package/tsconfig scaffold only (`export {}` placeholder) — no Zod schemas.
  - `tests/e2e/bootstrap-shell.spec.ts` + root `playwright.config.ts`: smoke test against the placeholder shell.
  - git repository initialized (`git init`); brain baseline and T00 bootstrap are separate commits.
- **Explicitly not changed:** no Google Places integration, no geolocation/location resolution, no cafe search/map/filters/favourites, no shared Zod contracts (T01 scope), no deployment, no accounts/auth/database.
- **Commands run:**

| Command | Exact result |
|---|---|
| `node scripts/validate-brain.mjs` | PASSED: 22 required files, 74 governed notes, 74 unique note IDs, 0 unresolved wiki links |
| `pnpm lint` | passed, 0 problems |
| `pnpm typecheck` | passed for `apps/api`, `apps/web`, `packages/contracts` |
| `pnpm test` | passed — apps/api 1/1, apps/web 2/2 |
| `pnpm build` | passed — `packages/contracts`, `apps/api` (`tsc`), `apps/web` (`tsc --noEmit && vite build`) |
| `pnpm e2e` | passed — 1/1 Playwright test (chromium) |
| manual: `node apps/api/dist/main.js` + `curl /health` + `SIGTERM` | health returned `{"status":"ok"}`; process exited status 0 with logged "shutting down" message (verified graceful shutdown, not a signal kill) |

- **Tests added/run:** `apps/web/src/App.test.tsx` (2 tests: renders `/` and `/favorites` routes), `apps/api/src/test/health.test.ts` (1 test: `/health` returns `{status:"ok"}`), `tests/e2e/bootstrap-shell.spec.ts` (1 test: shell renders, favorites link navigates). All pass.
- **Known failures:** none. One environment limitation: `playwright install --with-deps` failed (no passwordless sudo in this sandbox) — worked around by installing the chromium browser binary only (`playwright install chromium`), which was sufficient since required OS libraries were already present; `pnpm e2e` passed.
- **Security/provider review:** no real credentials committed; `.env.example` files contain placeholder names only; `GOOGLE_PLACES_SERVER_KEY` does not appear anywhere under `apps/web`; no `VITE_`-prefixed server key; no `.env`/`.env.local` files created; `dist/`, `node_modules/`, `coverage/`, `playwright-report/`, `test-results/` remain gitignored and were not staged.
- **Next safe task:** T01 (shared Zod contracts + environment validation) — dependency T00 is DONE. Per the build contract, stop here for a review checkpoint before starting T01. T03 (web shell/routes) is also now dependency-satisfied but not started.

#### Post-T00 correction (addendum, does not reopen T00)

- **Date:** 2026-08-27
- **What:** the root `dev` script's `pnpm --filter ./apps/* run dev` used an unquoted glob, which the Linux shell expanded before pnpm saw it, producing `None of the selected packages has a "./apps/web" script`. Corrected to `pnpm --parallel --filter "./apps/*" run dev` (quoted).
- **Commit:** `4f77e0b` — "fix: quote pnpm workspace dev filter".
- **Verification:** manually re-ran `pnpm dev` and confirmed both workspace apps start; `pnpm --filter ./apps/web dev` was already available independently as a narrower alternative.
- **Status:** T00 remains DONE. This is a runtime-script compatibility fix, not new scope.

---

### `T01` — Shared Zod contracts + environment validation

- **Date:** 2026-08-27
- **Executor:** Claude Code
- **Starting commit:** `4f77e0b` (fix: quote pnpm workspace dev filter)
- **Ending commit:** `8bcc548` (Implement T01: shared Zod contracts + environment validation)
- **Requirements:** none moved to VERIFIED in [[Traceability Matrix]] (see below); real partial evidence recorded here per the "do not fabricate coverage" rule.
- **Changed:**
  - `packages/contracts/src/{geo,cafe,search,errors,favorites,validation}.ts` + `index.ts`: real Zod schemas — `LatLng`, `OpenStatus`/`Cafe`, `RankPreference`/`CafeSearchRequest`/`CafeSearchResponse` (+ `CAFE_SEARCH_BOUNDS` constant), `ErrorCode`/`ErrorEnvelope`, `FavoriteRecord`/`FavoriteStore`, and a shared `formatValidationError(label, ZodError)` helper. All wire DTOs use `.strict()` to mirror `openapi.yaml`'s `additionalProperties: false`; env schemas deliberately do not (see below).
  - `packages/contracts/package.json`: added `dev` (tsc watch), `test` (vitest) scripts; `main`/`types` point at `dist/` (built by a new root `postinstall` hook, not source — see TypeScript-strategy note below).
  - `packages/contracts/tsconfig.build.json` (new): build-only tsconfig excluding `*.test.ts` from `dist/`, so published output isn't polluted with test files. `tsconfig.json` (typecheck) still includes tests.
  - `apps/api/src/env.ts`: rewritten with a Zod `ServerEnvSchema` (`PORT`, `WEB_ORIGIN`, `GOOGLE_PLACES_SERVER_KEY`, `GOOGLE_PLACES_TIMEOUT_MS` — all required, no in-code defaults, matching [[Environment Contract]] exactly); fails fast via `formatValidationError`.
  - `apps/api/package.json`: added `@bean-stalker/contracts` (`workspace:*`) dependency; `dev` script now `tsx watch --env-file=.env src/main.ts` (Node's native env-file loading — `tsx watch` alone never read `.env`, which would have broken `pnpm dev` the moment env vars became required); `build` now uses `tsconfig.build.json` (same test-exclusion fix as contracts — see Problems/bugs below).
  - `apps/api/vitest.config.ts`: added `test.include: ['src/**/*.test.ts']` as defense-in-depth against a stale `dist/` picking up compiled test files again.
  - `apps/web/src/env.ts` (new): `ClientEnvSchema` (`VITE_API_BASE_URL`, `VITE_GOOGLE_MAPS_BROWSER_KEY`), same fail-fast pattern; `apps/web/src/main.tsx` imports it for its side effect so validation runs at app bootstrap; `apps/web/src/vite-env.d.ts` gained an `ImportMetaEnv` augmentation for the two documented variables.
  - `apps/web/package.json`: added `@bean-stalker/contracts` (`workspace:*`) dependency.
  - root `package.json`: added `postinstall` (builds `packages/contracts` so `pnpm install` alone yields a working `dist/`); `dev` now also runs `packages/contracts`' watch build in parallel.
  - `eslint.config.js`: added `argsIgnorePattern`/`varsIgnorePattern: '^_'` for `@typescript-eslint/no-unused-vars`, needed by the destructured-omission pattern used in several new env tests.
  - `docs/00_HOME/Open Questions.md`: added OQ-006 (health route path mismatch: T00 built `/health`, canonical `openapi.yaml`/API Contract specify `/api/v1/health` — discovered while reading T01's canonical context, does not block T01, deferred to T05) and OQ-007 (favourite `snapshot` shape: [[Data Model]] types it as the full `Cafe`, [[Favorite Cafe Model]] describes a narrower "compact" shape — T01 implements literally per Data Model since that is T01's linked canonical doc, not Favorite Cafe Model; deferred to T02/T10).
  - Local-only, gitignored verification files (not committed): `apps/api/.env`, `apps/web/.env.local`, both with clearly-labeled non-functional placeholder credential strings, created solely to prove `pnpm dev`/`pnpm build` succeed without inventing real secrets (per the build contract's explicit instruction to document the developer action rather than fabricate credentials).
- **Explicitly not changed:** no Google Places calls, no geolocation, no cafe search/map/filters/favourites behaviour, no `/api/v1` route prefix fix (OQ-006, deferred to T05), no resolution of the favourite-snapshot-shape question (OQ-007, deferred to T02/T10).
- **TypeScript/workspace strategy (T01 changed T00's approach — explanation per the build contract):** T00 deliberately kept `packages/contracts` unbuilt since nothing depended on it. T01 makes it a real dependency of both apps, which raised a real ordering problem: `apps/api`'s production runtime (`node dist/main.js`, no transpiler) needs real compiled JS, but `apps/web`'s Vite and `apps/api`'s `tsx` both happily transpile TS from a workspace symlink, so pointing `packages/contracts`'s `main`/`types` at raw source would have worked for dev but broken `node dist/main.js`. Rather than adopt full TS project references (`composite`, `tsc -b`, a `references` array) for a single dependency edge, T01 uses the simpler fix: `packages/contracts` always has a real `dist/` build, guaranteed by a root `postinstall` hook (so `pnpm install` alone is sufficient — matches the Local Development Runbook's documented `pnpm install && pnpm dev` flow with no manual build step), plus a `tsc --watch` `dev` script so edits rebuild live during `pnpm dev` (confirmed working: `tsx watch`'s own file-watcher picked up a change to `packages/contracts/dist/index.js` and auto-restarted `apps/api` during the `pnpm dev` regression check). Project references remain the better answer if a second interdependent package appears; deferred until then.
- **Commands run:**

| Command | Exact result |
|---|---|
| `node scripts/validate-brain.mjs` | PASSED: 22 required files, 74 governed notes, 74 unique note IDs, 0 unresolved wiki links |
| `pnpm lint` | passed, 0 problems (after adding the `^_` ignore pattern) |
| `pnpm format` | passed, all matched files match Prettier style (after `--write` on 3 files) |
| `pnpm typecheck` | passed for `packages/contracts`, `apps/api`, `apps/web` |
| `pnpm test` | passed — 33 tests total: contracts 20/20, apps/api 6/6, apps/web 7/7 |
| `pnpm build` | passed — contracts → apps/api (`tsc`) → apps/web (`tsc --noEmit && vite build`, 158 modules, up from 71 pre-T01 confirming contracts was actually bundled) |
| `pnpm e2e` | passed — 1/1 Playwright test, using `apps/web/.env.local` placeholder |
| `pnpm dev` (root, all 3 workspace processes) | api `/health` → `{"status":"ok"}`; web `/` → HTTP 200; `packages/contracts`'s `tsc --watch` ran; all three stopped cleanly on SIGTERM |
| manual: `node apps/api/dist/main.js` with valid env, curl `/health`, SIGTERM | `{"status":"ok"}`; exit status 0 (graceful) — proves the compiled runtime really resolves `@bean-stalker/contracts` via `dist/`, not just dev-mode transpilation |
| manual: `node apps/api/dist/main.js` with **no** env vars set | printed a readable `Server environment validation failed:` listing all 4 missing/invalid fields, no secret values, no raw `ZodError` dump |
| manual: `grep` built `apps/web/dist/assets/*.js` for the server-key placeholder vs. the browser-key placeholder (distinct strings) | server-key placeholder **absent**; browser-key placeholder **present** — unambiguous proof of the credential trust boundary (this is real evidence for [[Test Case Catalog|TC-SEC-001]]) |

- **Tests added/run:** `packages/contracts`: `geo.test.ts` (4), `cafe.test.ts` (4), `search.test.ts` (5), `errors.test.ts` (4), `favorites.test.ts` (3) — 20 tests total, all testing Bean Stalker's documented rules (coordinate bounds, BR-09 radius/result bounds, BR-04/BR-05 open-status honesty, closed error-code set, favourite version). `apps/api/src/test/env.test.ts` (5): valid config, missing-var fail-fast, malformed URL, malformed port, no-secret-leakage. `apps/web/src/env.test.ts` (5): valid config, missing API URL, malformed API URL, missing Maps key, server-key-never-surfaces-in-parsed-output. All pass.
- **Known failures:** none outstanding. Two real bugs were found and fixed during this task (not pre-existing, both introduced and resolved within T01): (1) `packages/contracts`' build was compiling `*.test.ts` into `dist/`, harmless but wasteful — fixed with `tsconfig.build.json`. (2) `apps/api`'s build had the same issue, but it was actively harmful: a stale `dist/test/health.test.js` left over from T00 caused `pnpm test` to silently run the health test twice — fixed the same way, plus hardened `vitest.config.ts`'s `test.include` as defense-in-depth.
- **Security/provider review:** `GOOGLE_PLACES_SERVER_KEY` confirmed absent from the built browser bundle via direct grep (not just "should be" reasoning); server env schema requires the key as a non-empty string with no fallback; client env schema has no path to a server-only credential; Zod's default error messages for every rule used here (`invalid_type`, `too_small`, `too_big`, `invalid_format`) were verified empirically to report only type/bound information, never the received value, so `formatValidationError` cannot leak a secret through normal use; no `.env`/`.env.local` committed (confirmed via `git status --ignored`).
- **Next safe task:** T02 (domain helpers) and T05 (Fastify search + provider adapter) are both READY (dependency T01 is DONE); T03 (web shell/routes) remains READY and unstarted. Per the session's explicit scope, stopping here for a review checkpoint — not starting any of them.

---

### `T02` — Distance/filter/favourite domain helpers

- **Date:** 2026-08-27
- **Executor:** Claude Code
- **Starting commit:** `8342f70` (Record T01 implementation handoff evidence)
- **Ending commit:** `c4f42c0` (Implement T02: distance/filter/favourite domain helpers)
- **Requirements:** no Traceability Matrix row moved to VERIFIED; genuine partial unit evidence recorded against FR-008..011 and FR-012..014 (see below).
- **Domain decisions:**
  - **Module location:** new shared package `packages/domain` (`@bean-stalker/domain`), not `apps/web`. Reasoning: `Cafe.distanceMeters` is a *required* field in `openapi.yaml`/Data Model, and Google Places doesn't supply straight-line distance directly — T05's server-side provider adapter will need to compute it with the same Haversine formula T02 builds. Placing it only inside `apps/web` would make it unreachable from `apps/api`. Filter/sort/favourite logic currently has only frontend consumers per [[Task Graph]] (T09, T10), but living alongside distance in one cohesive, clearly-named package is simpler to explain than splitting T02's output across two locations. Recorded as [[Open Questions|OQ-009]] since [[Task Graph]] doesn't yet show `T05` depending on `T02` despite this real reuse need — not resolved unilaterally by editing the graph.
  - **Distance:** Haversine great-circle formula, meters, `EARTH_RADIUS_METERS = 6_371_000`. Reuses `LatLng` from `packages/contracts` — no duplicate coordinate type.
  - **Sort:** `sortCafes(cafes, 'DISTANCE' | 'RATING')`. Distance ascending by the already-present `distanceMeters` field (no recomputation — the API response already carries it). Rating descending, missing-rating cafes placed last, ties broken by higher `userRatingCount` then closer `distanceMeters` (tiebreak direction for count was unspecified — see [[Open Questions|OQ-008]]). Both-missing-rating pairs rely on `Array.prototype.sort`'s guaranteed stability to preserve input order, deliberately.
  - **Filter:** `filterCafes(cafes, { minRating?, openNow? })`. A *positive* `minRating` excludes unrated cafes; `minRating: 0` does not (Ranking and Filtering Rules' own qualifier: "does not pass **a positive** minimum-rating filter"). `openNow` only lets `OPEN` through — `UNKNOWN` is never treated as open (BR-04/BR-05). "Favourite" and "reset" are deliberately *not* separate filter-module functions: favouriting composes trivially as `cafes.filter(c => isFavorite(store, c.placeId))` using the exported `isFavorite`, and "reset" is simply not calling `filterCafes` — building dedicated functions for either would be unnecessary indirection.
  - **Favourites:** `isFavorite`/`addFavorite`/`removeFavorite` operate on the `FavoriteStore`/`FavoriteRecord` contracts from T01. Identity is `placeId` (BR-03) — never name/address/array position. `addFavorite` is idempotent and returns the *same* store reference when the cafe is already favourited; `removeFavorite` does the same for an absent `placeId`. Both return new objects (never mutate) on an actual change.
  - **OQ-007 resolution:** RESOLVED, not a real conflict — see [[Open Questions]]. The favourite `snapshot` stores the full `Cafe` per [[Data Model]] (already how T01 built `FavoriteRecordSchema`); [[Favorite Cafe Model]]'s "compact display snapshot" phrase describes what a UI shows, not a narrower persisted type. No contract change was needed.
- **Changed:**
  - `packages/domain/` (new package): `src/distance.ts`, `src/sort.ts`, `src/filter.ts`, `src/favorites.ts`, `src/index.ts` (deliberate public exports only) + matching `*.test.ts` for each; `package.json`, `tsconfig.json`, `tsconfig.build.json` mirroring `packages/contracts`' pattern exactly (build-only tsconfig excludes tests from `dist/`; `main`/`types` point at `dist/`).
  - Root `package.json`: `postinstall` generalized from a hardcoded contracts-only filter to `pnpm --filter "./packages/*" run build` (now covers any current/future shared package); added a new `predev` hook (`pnpm --filter "./packages/*" run build`) that runs *before* `pnpm dev`'s parallel watch group starts.
  - `docs/00_HOME/Open Questions.md`: OQ-007 marked RESOLVED with reasoning; added OQ-008 (rating-tie count-tiebreak direction, unspecified) and OQ-009 (Task Graph doesn't show T05 depending on T02).
  - `docs/08_QUALITY/Test Case Catalog.md`: added `TC-FILTER-005` (minimum-rating filter) — a genuine gap; FR-010 (minimum-rating filter) had no corresponding catalogued test case before this (only `TC-FILTER-002`, which covers rating *sort*, existed).
  - `docs/03_REQUIREMENTS/Traceability Matrix.md`: FR-008..011 and FR-012..014 rows annotated with which specific TC-IDs now have real unit evidence, kept at `PLANNED` overall (not fabricating row-level `VERIFIED` for partial coverage — see Requirements section below).
- **Explicitly not changed:** no Google Places/provider code, no React/UI components, no Fastify routes, no `localStorage`/persistence, no wiring of `packages/domain` into either app (that's T05/T09/T10's job) — confirmed via `grep`/manual inspection, not just intention.
- **A real bug found and fixed along the way:** the root `dev` script launched `apps/api`'s `tsx watch` in parallel with `packages/contracts`'/`packages/domain`'s `tsc --watch`, with no ordering guarantee. Deleting `dist/` and running `pnpm dev` cold reproduced a genuine crash: `apps/api` hit `ERR_MODULE_NOT_FOUND` resolving `@bean-stalker/contracts` before its first build finished, and — because the crash happened *before* `tsx` ever successfully loaded that dependency into its watched module graph — it did not self-heal even after `packages/contracts` finished building moments later (unlike a normal file-change-triggered restart, which does work once a module is already loaded once). Fixed with a `predev` hook that builds all `packages/*` synchronously before the parallel watchers start, closing the race unconditionally rather than relying on lucky timing.
- **Commands run:**

| Command | Exact result |
|---|---|
| `node scripts/validate-brain.mjs` | PASSED: 22 required files, 74 governed notes, 74 unique note IDs, 0 unresolved wiki links |
| `pnpm lint` | passed, 0 problems |
| `pnpm format` | passed (after `--write` on 3 new test files) |
| `pnpm typecheck` | passed for all 4 packages (`contracts`, `domain`, `apps/api`, `apps/web`) |
| `pnpm test` | passed — 64 tests total: contracts 20, domain 31, apps/api 6, apps/web 7 |
| `pnpm build` | passed — contracts → domain → apps/api → apps/web (158 modules, unchanged — confirms `packages/domain` is not yet bundled into the web app, as intended) |
| `pnpm e2e` | passed — 1/1 Playwright test |
| `pnpm dev` (cold, `dist/` deleted first) | reproduced the `predev` race bug (see above); after the fix, all 4 processes started cleanly, `/health` on port 3001 returned `{"status":"ok"}`, port 5173 returned HTTP 200, all stopped cleanly on SIGTERM |
| manual: `grep` built `apps/web/dist/assets/*.js` for server- vs. browser-key placeholders | server key absent, browser key present — credential boundary regression-checked, unchanged from T01 |

- **Tests added/run:** `packages/domain/src/distance.test.ts` (5): zero-distance, symmetry, exact meridian identity, realistic short-distance bound, linear-scaling sanity check. `sort.test.ts` (9): distance ordering/non-mutation/empty/single, rating ordering/missing-last/tiebreak/stability/non-mutation. `filter.test.ts` (10): no-filter passthrough, minRating exclusion/boundary/zero-case/zero-matches, openNow inclusion/passthrough, combined filters. `favorites.test.ts` (9): add/detect, idempotent add (count and reference), multi-favourite, full-snapshot storage, non-mutation, remove/isolation/absent-no-op. **31 new tests, all pass.**
- **Known failures:** none outstanding — the `predev` race described above was found and fixed within this task, not left open.
- **Security/provider review:** no new credential surface introduced; `packages/domain` has zero dependencies beyond `@bean-stalker/contracts` (type-only usage) and touches no environment variables, network, or storage APIs, consistent with its "pure, testable entirely in memory" mandate.
- **Next safe task:** T03 (web shell/routes) and T05 (Fastify search + provider adapter) are both READY (dependency T01 DONE). T09/T10 remain PENDING — they also depend on T07, which is not yet DONE. Per the session's explicit scope, stopping here for a review checkpoint.

---

### `T03` — Responsive React shell/routes

- **Date:** 2026-08-27
- **Executor:** Claude Code
- **Starting commit:** `eb188f0` (Record T02 implementation handoff evidence)
- **Ending commit:** `b7e0823` (Implement T03: responsive React shell/routes)
- **Requirements:** no Traceability Matrix row moved to VERIFIED; genuine partial unit/e2e evidence recorded against NFR-004/005 (see below).
- **Changed:**
  - `apps/web/src/components/Header.tsx` (new): brand `Link` + `nav aria-label="Primary"` with two `NavLink`s; active route gets `nav-link--active` (underline + font-weight, not colour alone) and React Router's own `aria-current="page"`.
  - `apps/web/src/components/AppShell.tsx` (new): layout-route component — skip link → `Header` → `<main id="main-content"><Outlet/></main>`. Rendered once via a React Router layout `<Route element={<AppShell />}>` wrapping `/`, `/favorites`, and `*`, so header/nav/landmarks are never duplicated per page.
  - `apps/web/src/routes/DiscoveryPage.tsx`, `FavoritesPage.tsx` (rewritten): honest, single "not yet wired" placeholder each — no fake interactive controls, no simulated Screen Inventory sub-components (LocationSearch/CafeList/CafeMap etc. were deliberately not stubbed out as empty boxes, since that risks reading as a broken layout rather than an intentional one). `FavoritesPage` includes Screen Inventory SCR-02's required local-only/staleness copy now, since it's accurate product copy, not fake functionality.
  - `apps/web/src/routes/NotFoundPage.tsx` (new): simple accessible 404 with a link home.
  - `apps/web/src/App.tsx`: switched from manually wrapping every route element in the same `<nav>`/`<main>` JSX to the layout-route + `Outlet` pattern.
  - `apps/web/src/styles/app.css` (new): plain CSS, no new dependency. Responsive container (`max-width` + padding, no fixed desktop widths), `flex-wrap` header/nav (no hamburger menu — two links simply wrap, per the task's own guidance not to invent one), `focus-visible` outlines, a visually-hidden-until-focused skip link.
  - `apps/web/src/main.tsx`: imports the new stylesheet.
  - `tests/e2e/bootstrap-shell.spec.ts` → renamed `app-shell.spec.ts` and rewritten: landmarks, nav round-trip, direct `/favorites` load, not-found route + return-home, and a 375px mobile-viewport horizontal-overflow check.
  - `docs/03_REQUIREMENTS/Traceability Matrix.md`: NFR-004/005 row annotated with which specific evidence now exists (see Requirements section below).
- **Explicitly not changed:** no Google Maps/Places code, no search/location/filter/sort UI behaviour, no favourite persistence, no `packages/domain` import into `apps/web` (confirmed — nothing in this task's diff touches it), no backend/domain code, no changes to `apps/api`'s startup architecture.
- **Manual UI verification:** captured real Playwright screenshots (desktop 1280×800 and mobile 375×667) against a running `pnpm dev` instance — confirmed: header/nav render correctly and wrap without overflow at mobile width; active-nav underline moves correctly between Discover/Favorites; the not-found page renders with a working "Return to Bean Stalker" link; page copy is readable at both widths. (First screenshot attempt raced a click before capturing — caught and redone with an explicit wait; not a product bug, a script bug in my own verification tooling.)
- **Commands run:**

| Command | Exact result |
|---|---|
| `node scripts/validate-brain.mjs` | PASSED: 22 required files, 74 governed notes, 74 unique note IDs, 0 unresolved wiki links |
| `pnpm lint` | passed, 0 problems |
| `pnpm format` | passed (after `--write` on 2 files) |
| `pnpm typecheck` | passed for all 4 packages |
| `pnpm test` | passed — 71 tests total: contracts 20, domain 31, apps/api 6, apps/web 14 (up from 7 — new landmark/skip-link/not-found/nav/keyboard tests) |
| `pnpm build` | passed — 162 modules (up from 158; CSS now emitted as a separate `dist/assets/*.css` chunk) |
| `pnpm e2e` | passed — 5/5 (was 1/1; expanded shell/nav/mobile-viewport coverage) |
| `pnpm dev` (all 4 processes) | api `/health` → `{"status":"ok"}` on port 3001; web served correctly; manual screenshots taken against this instance; all stopped cleanly |
| manual: `grep` built `apps/web/dist/assets/*.js` for the server-key placeholder | absent — credential boundary regression-checked, unchanged from T01/T02 |

- **Tests added/run:** `apps/web/src/App.test.tsx` expanded from 2 to 9 tests (landmarks present, skip link present, discovery/favorites/not-found routes render, return-home from 404, nav click navigates, `aria-current` on the active link only, Enter-key activates a focused nav link). `tests/e2e/app-shell.spec.ts` expanded from 1 to 5 Playwright tests (landmarks, nav round-trip, direct favorites load, not-found + return home, mobile viewport no-overflow). All pass.
- **Known failures:** none outstanding.
- **Security/provider review:** no new credential surface; no new dependency added at all (plain CSS, existing React Router). Credential boundary re-verified via bundle grep, unchanged from T01/T02.
- **Next safe task:** T04 (location resolution), T05 (Fastify search + provider adapter), and T06 (Maps JavaScript integration) are all READY (T04 needed both T01 and T03; T03 being DONE is what newly unblocks it). T09/T10 remain PENDING (still need T07). Per the session's explicit scope, stopping here for a review checkpoint — not starting any of them.

---

### `T04` — Current + manual location resolution

- **Date:** 2026-08-27
- **Executor:** Claude Code
- **Starting commit:** `fcd60bc` (Record T03 implementation handoff evidence)
- **Ending commit:** `20030df` (Implement T04: current + manual location resolution)
- **Requirements:** FR-001/002 moved `PLANNED` → `VERIFIED` in [[Traceability Matrix]] — all four catalogued test cases (TC-LOC-001..004) have genuine unit/component/e2e evidence, not partial coverage.
- **Discovered spec conflict (OQ-010, recorded before implementation):** [[Location Resolution]] (T04's own linked canonical doc) says manual location is "resolved by Google Maps client-side location tooling," but T04's task scope explicitly excludes Google dependencies, and [[Task Graph]] doesn't make T04 depend on T06 (Maps integration) — meaning T04 must be buildable without any Google Maps SDK. Resolved for T04's scope: manual location is a plain, provider-independent latitude/longitude/optional-label form. It's fully functional today (produces a real, usable `SearchCenter`), not a placeholder, and matches [[Location Resolution]]'s own fallback guidance for exactly this situation ("prefer an honest intermediate boundary... no fake geography"). Whether to later upgrade this to a real Places Autocomplete widget is left to T06/T07, per OQ-010.
- **Domain decisions:**
  - **Shared contract:** added `SearchCenterSchema` to `packages/contracts` (`LatLngSchema.extend({ label: z.string().min(1).optional() })`) rather than a frontend-only `Coordinates` interface — reuses the coordinate validation instead of duplicating it.
  - **State model:** a discriminated union (`idle | resolving | resolved | error`), not scattered booleans — a "resolving-and-errored-at-the-same-time" state is structurally impossible to represent, unlike with separate `isLoading`/`hasError` flags. `LocationErrorReason` reuses `ErrorCode` from `packages/contracts` (`LOCATION_PERMISSION_DENIED` / `LOCATION_UNAVAILABLE` / `VALIDATION_ERROR`) instead of inventing a second, parallel error vocabulary — Error Catalog has no separate code for `POSITION_UNAVAILABLE` vs. `TIMEOUT` (both get "retry/manual location" treatment), so both browser codes map to the single `LOCATION_UNAVAILABLE`.
  - **Re-resolution / non-interference:** the reducer always *replaces* the whole state on `REQUEST_CURRENT`/`REQUEST_MANUAL`/`RESOLVED`, never merges — so a failed current-location attempt never blocks a later manual submission, and a fresh current-location request cleanly discards a previously-resolved manual origin. Verified directly by reducer unit tests, not just inferred from the code.
  - **Browser boundary:** `navigator.geolocation` is touched in exactly one file (`browserGeolocation.ts`), behind a small `GeolocationAdapter` interface the hook accepts as an (optional, defaulted) parameter — tests inject a fake adapter instead of mocking global browser APIs for the hook-level tests, and mock `navigator.geolocation` directly only for the one component-level test that needs to prove the real wiring holds end-to-end.
  - **Geolocation options:** `enableHighAccuracy: false`, `timeout: 10_000`, `maximumAge: 60_000` — none specified by [[Location Resolution]]; documented as an implementation assumption. High accuracy is unnecessary (and battery-costly) for cafe-radius discovery; a 1-minute cached fix is acceptable; 10s keeps "resolving" from hanging indefinitely.
  - **Validation-before-native-blocking bug found and fixed:** the manual form's `<input type="number" max={90}>` silently blocked form submission via native HTML5 constraint validation before my `onSubmit` handler ever ran for out-of-range values — meaning out-of-range latitude would show a browser-native popup instead of the app's unified, accessible status message. Fixed with `noValidate` on the form; `min`/`max`/`required` attributes remain for numeric-keyboard/spinner hints, but `SearchCenterSchema` is now the single source of truth for validation feedback.
- **Changed:**
  - `packages/contracts/src/geo.ts` (+`index.ts`, +`geo.test.ts`): `SearchCenterSchema`/`SearchCenter`.
  - `apps/web/src/location/` (new module, matching SDD's already-named "location" frontend module): `locationState.ts`, `geolocationErrors.ts`, `browserGeolocation.ts`, `useLocation.ts`, `LocationSelector.tsx`, `ManualLocationForm.tsx` + a `*.test.ts(x)` for each.
  - `apps/web/src/routes/DiscoveryPage.tsx`: wired in `<LocationSelector />`; copy updated to reflect that location resolution now works while search still doesn't.
  - `apps/web/src/styles/app.css`: `.location-selector`/`.manual-location-form`/`.form-field`/`.location-status` + the first real `button`/`input` styling in the app (T03 never needed either).
  - `tests/e2e/location.spec.ts` (new): granted-geolocation success, denied-permission fallback, standalone manual flow, mobile viewport, T03-regression (`/favorites` still loads).
  - `docs/00_HOME/Open Questions.md`: added OQ-010 (Google-tooling vs. task-boundary conflict, above).
  - `docs/03_REQUIREMENTS/Traceability Matrix.md`: FR-001/002 → `VERIFIED`.
- **Explicitly not changed:** no Google Places/Maps code, no cafe search call, no `packages/domain` import (filter/sort/favourites untouched), no favourite persistence, no changes to `apps/api` or backend startup architecture — confirmed via diff review.
- **Commands run:**

| Command | Exact result |
|---|---|
| `node scripts/validate-brain.mjs` | PASSED: 22 required files, 74 governed notes, 74 unique note IDs, 0 unresolved wiki links |
| `pnpm lint` | passed, 0 problems |
| `pnpm format` | passed (after `--write` on 6 files) |
| `pnpm typecheck` | passed for all 4 packages |
| `pnpm test` | passed — 101 tests total: contracts 24 (+4), domain 31, apps/api 6, apps/web 40 (+27) |
| `pnpm build` | passed — 168 modules (up from 162); CSS grew from 1.98kB to 3.02kB (new location styles) |
| `pnpm e2e` | passed — 10/10 (was 5/5; new `location.spec.ts` confirms denied-permission behaviour in a *real* headless Chromium context, not just a unit mock) |
| `pnpm dev` (all 4 processes, cold) | api `/health` → `{"status":"ok"}`; web served correctly; `predev` hook confirmed still closing the shared-package race from T02 |
| manual: `grep` built `apps/web/dist/assets/*.js` for the server-key placeholder | absent — credential boundary regression-checked, unchanged |
| manual: 4 Playwright screenshots (desktop granted-success, desktop denied→manual-success, mobile) against a running `pnpm dev` | all render correctly: readable, on-palette, no overflow, active states correct |

- **Tests added/run:** `packages/contracts`: 4 new `SearchCenterSchema` tests. `apps/web/src/location/`: `locationState.test.ts` (7), `geolocationErrors.test.ts` (4), `useLocation.test.ts` (10, covering success/resolving/permission-denied/unavailable/timeout/unsupported/manual-valid/manual-invalid/current-failure-then-manual-success/reset), `LocationSelector.test.tsx` (5, component-level with a mocked `navigator.geolocation`). `tests/e2e/location.spec.ts`: 5 Playwright tests using real browser-context geolocation permissions/mocking. **31 new automated tests, all pass**, plus 4 manual screenshots.
- **Known failures:** none outstanding. One real bug (native HTML5 validation silently intercepting out-of-range submissions before Zod ran) was found and fixed within this task — see above.
- **Security/provider review:** no coordinates logged anywhere (verified by reading every new file — no `console.*` calls exist in `apps/web/src/location/`); no `localStorage`/persistence of any kind; resolved coordinates live only in React's in-memory `useReducer` state, cleared on `reset()`/unmount; no new credential surface; server key re-confirmed absent from the browser bundle.
- **Next safe task:** T05 (Fastify search + provider adapter) and T06 (Maps JavaScript integration) are both READY (dependency T01/T03 DONE respectively). T07 (search orchestration) remains PENDING — needs T04 *and* T05 *and* T06; T04 being DONE is necessary but not sufficient. Per the session's explicit scope, stopping here for a review checkpoint.

---

### `T05` — Fastify cafe search + Google Places provider adapter

- **Date:** 2026-08-27
- **Executor:** Claude Code
- **Starting commit:** `dc7c0c7` (Record T04 implementation handoff evidence)
- **Ending commit:** `2ac2fc4` (Implement T05: Fastify cafe search + Google Places provider)
- **Requirements:** FR-007, FR-018, FR-019 moved `PLANNED` → `VERIFIED`. FR-003/004 and NFR-001/002 gained substantial partial evidence (annotated, not fully verified — see [[Traceability Matrix]]).
- **OQ-009 resolved before implementation:** confirmed `apps/api` genuinely needs T02's `haversineDistanceMeters` (Google doesn't supply distance; `Cafe.distanceMeters` is required) — added `@bean-stalker/domain` as a real dependency, no duplicate formula. [[Task Graph]]/[[Task Status]] updated: `T05` now depends on `T01,T02`.
- **OQ-006 resolved as part of this task's routing work:** `/health` stays unprefixed (infra liveness checks conventionally sit outside API versioning); the new `/api/v1` prefix is reserved for versioned business routes, starting with `POST /api/v1/cafes/search`. `openapi.yaml` and [[API Contract]] updated to document `/health` (not `/api/v1/health`) to match this deliberate decision.
- **Two real documentation gaps found and filled (not silently, both recorded):**
  1. [[Seed Data Catalog]] planned `tests/fixtures/nearby-cafes-{happy,empty,malformed}.json` but they were never created (T00–T04 never needed them). Created them now, shaped like Google Places API (New) `searchNearby` responses — 5 places covering rated/unrated/open/closed/unknown-hours/missing-address, an empty-results fixture (`{}`, matching Google's real behavior of omitting the `places` key entirely rather than returning `places: []`), and a malformed fixture (a place missing its required `id`).
  2. [[Traceability Matrix]] referenced `TC-API-001..005` for FR-018/FR-019, but [[Test Case Catalog]] had no "API" section at all. Added the five missing entries, matching what T05 actually tests.
- **Architecture:**
  - `apps/api/src/providers/cafeProvider.ts`: `CafeProvider` interface (`searchNearby(request): Promise<Cafe[]>`), so the route depends on an abstraction, not `fetch()`/Google directly.
  - `apps/api/src/providers/providerError.ts`: `ProviderError` (narrowed to exactly the 4 provider `ErrorCode`s it can carry, so the route's status-code lookup is exhaustive and type-safe with no cast).
  - `apps/api/src/providers/google-places/` (path matches [[SDD]] section 5 exactly): `googlePlacesSchemas.ts` (private, non-strict Zod schemas for Google's raw response — Bean Stalker doesn't control Google's schema evolution, so unknown extra fields are stripped, not rejected; `id`/`displayName`/`location` are load-bearing and required since `Cafe` cannot be constructed without them), `googlePlacesMapper.ts` (pure `mapGooglePlaceToCafe`, no network), `googlePlacesProvider.ts` (the actual HTTP-calling `GooglePlacesProvider`, constructor-injectable `fetchImpl` — same DI pattern as T04's `GeolocationAdapter`, for the same reason: tests inject a fake instead of mocking Node's global `fetch`).
  - `apps/api/src/routes/cafeSearch.ts`: thin route — Zod-validate request → provider.searchNearby → Zod-validate response → send; provider failures caught and mapped via a small `Record<ProviderErrorCode, number>` lookup; anything else rethrown to the global handler.
  - `apps/api/src/app.ts`: `buildApp` signature changed from `(webOrigin: string)` to `({ webOrigin, cafeProvider })` — a deliberate breaking change to inject the provider; added `app.setErrorHandler` so even a malformed/unparsable JSON body returns Bean Stalker's envelope, not Fastify's default shape. `main.ts` now constructs the real `GooglePlacesProvider` from the already-validated `ServerEnv` (`env.googlePlacesServerKey`, `env.googlePlacesTimeoutMs`) — never touches `process.env` directly.
- **Google Nearby Search request:** `POST https://places.googleapis.com/v1/places:searchNearby`, `includedTypes: ["cafe"]` (matches OQ-003's cafe-focused baseline), `X-Goog-Api-Key`, `X-Goog-FieldMask` set to exactly 10 fields (`places.id`, `.displayName`, `.formattedAddress`, `.location`, `.rating`, `.userRatingCount`, `.priceLevel`, `.currentOpeningHours.openNow`, `.businessStatus`, `.googleMapsUri`) — never `*`. `radiusMeters`/`maxResults`/`rankPreference` pass straight through from the already-bounded `CafeSearchRequest` (Google's own accepted ranges for `circle.radius`, `maxResultCount` [1-20], and `rankPreference` enum values happen to exactly match Bean Stalker's own `CAFE_SEARCH_BOUNDS`/`RankPreferenceSchema`, so no re-clamping or translation is needed). Timeout via `AbortSignal.timeout(env.googlePlacesTimeoutMs)`.
- **Mapping:** `openNow: true/false/absent` → `OPEN`/`CLOSED`/`UNKNOWN` (never inferred as OPEN from mere presence of hours data); every other optional Google field passes straight through or stays `undefined` — never fabricated. `distanceMeters` computed via `haversineDistanceMeters(searchCenter, place.location)`, not reimplemented.
- **Provider error mapping:** HTTP 401/403 → `PROVIDER_AUTH_ERROR` (502); 429 → `PROVIDER_RATE_LIMITED` (503); any other non-2xx, network failure, or timeout → `PROVIDER_UNAVAILABLE` (503); a response that fails Zod validation (missing required fields) or isn't JSON → `PROVIDER_BAD_RESPONSE` (502). Any non-`ProviderError` throw is caught by the global error handler and returned as a generic `INTERNAL_ERROR` (500) — the raw message never reaches the client (test-verified), though it is logged server-side for diagnostics.
- **Changed:**
  - `apps/api/package.json`: added `@bean-stalker/domain` dependency.
  - `apps/api/src/providers/{cafeProvider,providerError}.ts`, `apps/api/src/providers/google-places/{googlePlacesSchemas,googlePlacesMapper,googlePlacesProvider}.ts` (+ matching `*.test.ts`), `apps/api/src/routes/cafeSearch.ts` (+ `apps/api/src/test/cafeSearch.test.ts`), `apps/api/src/app.ts`, `apps/api/src/main.ts`, `apps/api/src/test/health.test.ts` (updated for the new `buildApp` signature).
  - `tests/fixtures/nearby-cafes-{happy,empty,malformed}.json` (new).
  - `docs/06_INTERFACES/{openapi.yaml, API Contract.md}`: `/api/v1/health` → `/health`.
  - `docs/08_QUALITY/Test Case Catalog.md`: new "API" section (`TC-API-001..005`).
  - `docs/00_HOME/Open Questions.md`: OQ-009 and OQ-006 marked RESOLVED.
  - `docs/09_EXECUTION/Task Graph.md`, `Task Status.md`: `T05` depends on `T01,T02`.
  - `docs/03_REQUIREMENTS/Traceability Matrix.md`: FR-007/018/019 → `VERIFIED`; FR-003/004 and NFR-001/002 annotated with partial evidence.
- **Explicitly not changed:** no Google Maps JS/map rendering, no React cafe fetching/`useQuery`/result cards, no autocomplete/geocoding (OQ-010 untouched), no filter/sort UI, no favourite persistence, no changes to `apps/web`'s location module — confirmed via diff review.
- **Commands run:**

| Command | Exact result |
|---|---|
| `node scripts/validate-brain.mjs` | PASSED: 22 required files, 74 governed notes, 74 unique note IDs, 0 unresolved wiki links |
| `pnpm lint` | passed (after removing 6 forbidden non-null assertions from test files, replaced with explicit runtime checks) |
| `pnpm format` | passed (after `--write` on 6 files) |
| `pnpm typecheck` | passed for all 4 packages |
| `pnpm test` | passed — 130 tests total: contracts 24, domain 31, apps/web 40, apps/api 35 (was 6 — +7 mapper, +12 provider, +10 route) |
| `pnpm build` | passed — apps/web unchanged at 168 modules (confirms no accidental frontend coupling to the new backend code) |
| `pnpm e2e` | passed — 10/10, unchanged (T05 is backend-only; no e2e coverage change was warranted or made) |
| `pnpm dev` (all 4 processes, cold) | clean startup; `/health` → `{"status":"ok"}` |
| manual: `curl -X POST /api/v1/cafes/search` with a valid body, real (placeholder/fake) server key | **made a genuine live network call to Google's real endpoint** — Google rejected the fake key, correctly mapped to `PROVIDER_UNAVAILABLE`/503, no crash, no leaked detail |
| manual: `curl -X POST /api/v1/cafes/search` with `latitude: 999` | 400, `VALIDATION_ERROR`, clear field-level message, provider never invoked |
| manual: `grep` built `apps/web/dist/assets/*.js` for the server key | absent — credential boundary regression-checked |

- **Tests added/run:** `googlePlacesMapper.test.ts` (7): full mapping, missing-optional-fields honesty, openNow→OPEN/CLOSED/UNKNOWN, distance delegation, empty/malformed response schema handling. `googlePlacesProvider.test.ts` (12): request shape/headers/field-mask, successful mapping, empty results, 401/403/429/500 mapping, malformed response, non-JSON body, timeout, generic network failure, no-key-leak-in-error. `cafeSearch.test.ts` (10): 200 success, 200 empty, 400 for out-of-range/missing-field/unknown-field, 502/503/500 provider-failure mapping, malformed-JSON-body envelope consistency. **29 new tests, all pass.**
- **Known failures:** none outstanding. All 6 ESLint non-null-assertion violations were fixed within this task, not left as debt.
- **Live provider verification:** NOT PERFORMED as a genuine success case — no valid `GOOGLE_PLACES_SERVER_KEY` exists in this sandbox (only T01/T04's non-functional placeholder). Per the task's own instruction, no fake "successful" result is claimed. The manual malformed-key test above did incidentally make a real network call to Google's actual endpoint and observed a real rejection, safely handled — genuine (if limited) evidence that the network path itself functions, distinct from a real cafe-data verification.
- **Security/privacy review:** server key read only from the validated `ServerEnv` (never `process.env` directly in provider code); never logged, never returned, never reaches the client even in error paths (test-verified); provider failures log only `{ providerErrorCode }`, never Google's raw response body or the key; search coordinates flow browser→API→Google for the single active request only — nothing is persisted, no analytics, no coordinate logging.
- **Next safe task:** T06 (Maps JavaScript integration) is READY (dependency T03 DONE). T07 (search orchestration) remains PENDING — needs T06 too, not just T04+T05. Per the session's explicit scope, stopping here for a review checkpoint.

---

### `T06` — Google Maps JavaScript map integration

- **Date:** 2026-08-27
- **Executor:** Claude Code
- **Starting commit:** `a23abca` (Record T05 implementation handoff evidence)
- **Ending commit:** `2b769de` (Implement T06: Google Maps JavaScript map integration)
- **Requirements:** no Traceability Matrix row moved to `VERIFIED`. NFR-004/005's row gained genuine new partial evidence for the map surface itself (see below); no FR row references map-rendering as its own testable requirement, and cafe-result/marker requirements (owned by T07) are deliberately left untouched.
- **OQ-010 reviewed, not resolved by T06:** confirmed T06's actual canonical scope ([[System Architecture]], [[API Key Boundaries]]) is map-rendering infrastructure only, and [[Screen Inventory]]'s `CafeMarker` is unambiguously a *cafe-result* marker component owned by T07 ("search orchestration/list/marker sync"), not location-input UX. T06 therefore does not touch manual-location-mechanism question. [[Open Questions]]'s OQ-010 entry updated to say so explicitly and left open, carried forward to T07/a dedicated follow-up rather than closed to shrink the list.
- **Architecture:**
  - `apps/web/src/map/googleMapsLoader.ts`: a small, hand-written script loader (deliberately not `@react-google-maps/api`/`google-map-react` — "prefer the smallest maintainable solution," and a hand-rolled loader is more defensible to explain than a third-party dependency's internals). Uses the current Google-recommended pattern: injects `<script src=".../js?key=...&loading=async&callback=beanStalkerGoogleMapsCallback">` and resolves a shared, memoized promise when Google's callback fires (never the deprecated synchronous bootstrap tag). Guards against duplicate script injection by a fixed script `id`; a failed load can be retried (the memoized promise is cleared on rejection, not cached forever); exposes `resetGoogleMapsLoaderForTests()` for deterministic test isolation.
  - `apps/web/src/map/CafeMap.tsx`: owns its own `<div>` container and a `useRef<google.maps.Map | null>` — never destroys/recreates the map on a location change, calls `setCenter` instead. A discriminated `MapLifecycle` (`'loading' | 'ready' | 'error'`) plus a purely render-derived `'no-center'` status (never stored in `useState` — see lint fix below) drive which of: nothing (map visible), a "set a location above" prompt, an accessible loading message, or an accessible non-crashing error message, is shown. No markers, no cafe fetching, no filter/sort UI, no favourites, no autocomplete/geocoding — structurally complete without any of T07's data orchestration, per the task's explicit "a map can be structurally complete without cafe-result orchestration" guidance.
  - `@types/google.maps` added as a type-only devDependency (no runtime code) and to `apps/web/tsconfig.json`'s explicit `"types"` array (that array is not implicit-inclusive once given). `google.maps.importLibrary('maps')` is correctly typed via its `ImportLibraryMap` overload, so `const { Map } = await google.maps.importLibrary('maps')` needs no cast.
  - No `mapId` used — Advanced Markers (which require one) are not implemented in T06, matching the guidance that a `mapId` is only needed if Advanced Markers are canonically owned by the current task; a `DEMO_MAP_ID` was deliberately not fabricated for a feature that doesn't exist yet.
  - `SearchCenter` → `google.maps.LatLngLiteral` conversion is localized entirely inside `CafeMap`'s effect — no Google types leak into `packages/contracts` or any other React component.
  - **Architectural change (necessary, not scope creep):** `LocationSelector` was refactored from a self-contained component that called `useLocation()` internally into a purely presentational component (`LocationSelectorProps { state, requestCurrentLocation, submitManualLocation }`). `DiscoveryPage` now owns the single `useLocation()` call and passes the resolved `SearchCenter` (or `undefined`) to both `LocationSelector` and `CafeMap`. This was required because the two components must observe the *same* resolved location instance, not two independently-hooked copies that could drift.
  - **Lint fix (`react-hooks/set-state-in-effect`):** the first implementation called `setLifecycle({status: 'no-center'})` synchronously at the top of the location-change `useEffect` when no center was resolved. Fixed by deriving `'no-center'` purely from the `center` prop during render (`const status = center ? lifecycle : 'no-center'`), so `setState` is only ever called inside the async `initialize()` continuation, never synchronously in the effect body.
  - **Accessible-name disambiguation (found and fixed during T06's own e2e validation, not left as a known failure):** once `CafeMap` renders a `role="status"` loading/error message alongside `LocationSelector`'s pre-existing `role="status"` region, `tests/e2e/location.spec.ts`'s generic `page.getByRole('status')` calls became ambiguous (Playwright strict-mode violation: 2 elements matched). Both regions are legitimately separate live-region announcements (location-resolution status vs. map-loading status), so the fix was **not** to remove either role but to give each a distinguishing `aria-label` (`"Location status"` / `"Map status"`) and update the 3 affected e2e assertions to `page.getByRole('status', { name: 'Location status' })`. `LocationSelector`'s and `CafeMap`'s own isolated unit tests were unaffected (each renders only its own status region in isolation, so no ambiguity exists there).
- **Changed:**
  - `apps/web/package.json`: added `@types/google.maps` devDependency.
  - `apps/web/tsconfig.json`: added `"google.maps"` to the `"types"` array.
  - `apps/web/src/map/{googleMapsLoader,CafeMap}.ts(x)` (new) + matching `*.test.ts(x)` for each.
  - `apps/web/src/location/LocationSelector.tsx` (refactored to presentational props) + `LocationSelector.test.tsx` (updated with a `Harness` component reproducing `DiscoveryPage`'s wiring so real hook behaviour is still exercised) — added `aria-label="Location status"`.
  - `apps/web/src/routes/DiscoveryPage.tsx` (rewritten to own the single `useLocation()` call and wire both children).
  - `apps/web/src/styles/app.css`: `.cafe-map`, `.cafe-map__surface`, `.cafe-map__status` + a mobile-height override in the existing 30rem breakpoint. Plain CSS only, matching T03's existing visual language — no new UI dependency.
  - `tests/e2e/location.spec.ts`: 3 assertions scoped to `getByRole('status', { name: 'Location status' })` to disambiguate from `CafeMap`'s new status region.
  - `docs/00_HOME/Open Questions.md`: OQ-010's resolution-point text revised to record that T06 does not own it (see above) — not closed.
  - `docs/00_HOME/Current Execution Focus.md`, `docs/00_HOME/Current Project State.md`: updated for T06 DONE / T07 READY-but-not-started.
  - `docs/03_REQUIREMENTS/Traceability Matrix.md`: NFR-004/005 row annotated with the new map-surface evidence; TC-A11Y-002/003 explicitly still not evidenced (favourites/cafe-result-map-parity don't exist yet).
  - `docs/09_EXECUTION/Task Status.md`: `T06` → `DONE`, `T07` → `READY`.
- **Explicitly not changed:** no markers, no cafe fetching/`useQuery` wiring, no filter/sort UI, no favourites persistence, no manual-location-autocomplete/geocoding upgrade (OQ-010 left open), `apps/api` untouched (no genuine contract mismatch was found), `GOOGLE_PLACES_SERVER_KEY` never referenced anywhere under `apps/web` — confirmed via `grep`, not just intention.
- **Commands run:**

| Command | Exact result |
|---|---|
| `node scripts/validate-brain.mjs` | PASSED: 22 required files, 74 governed notes, 74 unique note IDs, 0 unresolved wiki links |
| `pnpm lint` | passed, 0 problems |
| `pnpm format` | passed, all matched files already matched Prettier style |
| `pnpm typecheck` | passed for all 4 packages |
| `pnpm test` | passed — 142 tests total: contracts 24, domain 31, apps/web 52 (+12: 6 loader, 6 CafeMap), apps/api 35 |
| `pnpm build` | passed — 170 modules (up from 168); server key confirmed absent, browser key present, via `grep` on `apps/web/dist/assets/*.js` |
| `pnpm e2e` | passed — 10/10 (3 initially failed on the `role="status"` ambiguity described above; fixed and re-run, all pass) |
| `pnpm dev` (all 4 processes, cold) | clean startup; `/health` → `{"status":"ok"}`; web served correctly; both stopped cleanly |
| manual: real network smoke test of the Maps loader against a running `pnpm dev` instance (headless Chromium, this sandbox's own placeholder `VITE_GOOGLE_MAPS_BROWSER_KEY`) | the map reached `'ready'` state and its surface became visible — Google's Maps JS API tolerates an invalid/placeholder key for basic script loading and map display (shows its own "for development purposes only" watermark) rather than rejecting the request outright, so this confirms the real loader→`importLibrary`→`new Map()` pipeline works end-to-end against live Google infrastructure. It does **not** verify referrer/API-key-restriction configuration, which needs an actual restricted production key — that remains unverified, same situation as T05's live Places key |
| manual: no-center / mobile-viewport / keyboard / `/favorites` checks against the same running instance | no-center prompt shown before a location is set; no horizontal overflow at 375px with the map present; `Tab` from a fresh load focuses the skip link first (unchanged from T03); `/favorites` still loads directly |
| manual: `grep` built `apps/web/dist/assets/*.js` for the server-key placeholder vs. the browser-key placeholder | server-key placeholder **absent**; browser-key placeholder **present** — credential boundary regression-checked, unchanged |

- **Tests added/run:** `apps/web/src/map/googleMapsLoader.test.ts` (6): already-loaded short-circuit, concurrent-call dedup, resolve-on-callback, reject-on-script-error with a clear message, retry-after-failure, correct URL construction (async/weekly/encoded key). `apps/web/src/map/CafeMap.test.tsx` (6): no-center message with no Maps load attempted, accessible loading state, exactly-one-map-instance centered on the resolved `SearchCenter`, re-center (not recreate) on location change, non-crashing error status on load failure, reverting to the no-center message if the center is cleared. All mock the loader/`window.google.maps.importLibrary` boundary — no live/billable Google call in any automated test. **12 new tests, all pass.**
- **Known failures:** none outstanding. The `role="status"` e2e ambiguity was a real regression introduced within this same task by wiring `CafeMap` into `DiscoveryPage`, found during T06's own validation pass and fixed within T06 (not deferred) — see above.
- **Security/provider review:** only `VITE_GOOGLE_MAPS_BROWSER_KEY` (already-documented, intentionally browser-visible) is referenced anywhere in `apps/map/`; `GOOGLE_PLACES_SERVER_KEY` does not appear under `apps/web` (`grep`-verified); no new environment variable was introduced, so [[Environment Contract]] needed no change; no coordinates or map state are logged or persisted.
- **New open question considered, not recorded:** T06 raised no genuine new spec ambiguity beyond OQ-010 (already open). The default zoom level (`DEFAULT_ZOOM = 15`) is an undocumented-by-canon implementation default, recorded as an inline code comment per the task's own "document the assumption" guidance rather than as a full Open Question, since it is a trivial, easily-revisable UI default with no downstream contract implications — unlike OQ-008/009/010, which are genuine cross-document conflicts.
- **Next safe task:** T07 (search orchestration/list/marker sync) is READY (dependencies T04, T05, T06 all DONE). Per the session's explicit instruction, stopping here — not starting T07 or any later task.

---

### `T07` — Search orchestration / cafe result list / map marker synchronization

- **Date:** 2026-08-28
- **Executor:** Claude Code
- **Starting commit:** `f649281` (Record T06 implementation handoff evidence)
- **Ending commit:** `96b914b` (Implement T07: search orchestration, cafe list & map marker sync)
- **New authoritative constraint recorded (RM0):** the project owner's portfolio no-cost operating constraint was added to [[Non-Functional Requirements|NFR-009]] as sub-section **RM0** (existing NFR numbering, not a new invented ID), with the frontend/deferred split spelled out; a new release blocker [[Known Blockers|BLK-003]] records the server/infra half (Fastify rate limiting, Cloud quotas, budget alerts, key restrictions). [[ADR-007 Cost-Safe Search Orchestration]] records the engineering decisions.
- **OQ review:** OQ-008 (rating tie-break) — untouched, carried forward; T07 renders API order and adds no sort control. OQ-010 (manual-location mechanism) — untouched, carried forward; raw lat/lng entry unchanged, T07 does not own location-input UX. New **OQ-011** recorded for the fixed search parameters (radius 2000 / maxResults 10 / rank DISTANCE / staleTime 5 min) — trivially revisable constants, to confirm at T09/T11.

- **Architecture:**
  - **Search boundary (`apps/web/src/search/`):**
    - `apiClient.ts` — `searchCafes(request, signal)`: the single browser→API call. Validates the outbound body with `CafeSearchRequestSchema` before sending (rejects before `fetch` if out of contract); POSTs JSON to `${VITE_API_BASE_URL}/api/v1/cafes/search`; forwards the TanStack Query `AbortSignal`; runtime-validates the response — `CafeSearchResponseSchema` on 2xx, `ErrorEnvelopeSchema` on non-2xx — never a bare `as` cast. Throws a typed `CafeSearchError { code: ErrorCode, message, requestId? }`; a native `AbortError` is re-thrown untouched (superseded search, not a failure); a network throw maps to `PROVIDER_UNAVAILABLE`; an unrecognisable error body maps to `INTERNAL_ERROR`. No raw provider/framework payload ever reaches the UI.
    - `searchRequest.ts` — `buildCafeSearchRequest(center)` drops `SearchCenter.label` (request `center` is a strict `LatLng`) and applies the OQ-011 defaults; `cafeSearchQueryKey(request)` returns `['cafes','search', lat, lng, radius, maxResults, rank]` — primitives only, **coordinates unrounded** (no canonical normalization rule).
    - `useCafeSearch.ts` — the cost-safe hook ([[ADR-007 Cost-Safe Search Orchestration]]): `enabled: center != null`, `retry: false`, `refetchOnWindowFocus/Reconnect/Mount: false`, `refetchInterval: false`, `staleTime: 5 min`, `gcTime: 10 min`. Returns a discriminated `CafeSearchView` (`no-location | loading | success{cafes,fetchedAt,isEmpty} | error{error,canRetry}`) plus an explicit `retry()`.
    - `errorCopy.ts` — `describeSearchError(code)` (Error-Catalog-keyed user copy; API `message` is *not* surfaced verbatim) and `isRetryable(code)`.
  - **Result surface (`apps/web/src/cafes/`):** `formatCafe.ts` (distance m/km, price `$`-tiers or `null`, `describeRating` → `"4.8 ★ (342)"` / `"No rating data"`, `describeOpenStatus` → `UNKNOWN` = "Hours unavailable" **never** "Closed"); `CafeCard.tsx`/`CafeList.tsx` (`<section aria-label="Cafe results">` → `<ul>` → `<li>`; each card a `<button aria-pressed>` with a visible "Selected" cue; Maps link is a separate `<a target="_blank" rel="noreferrer noopener">` rendered only when `googleMapsUri` present; selected card `scrollIntoView`, jsdom-guarded); `SearchStatePanel.tsx` (distinct `no-location` / `loading` (`role="status"`) / `empty` / `error` (`role="alert"` + Retry when retryable); renders nothing on non-empty success — the list owns that).
  - **Map markers (`apps/web/src/map/markerLayer.ts` + `CafeMap.tsx`):** `MarkerLayer` is a **non-React class** that owns every `AdvancedMarkerElement` mutation (`marker.map = null`, `marker.content = …`) — this keeps `CafeMap`'s effects to method-calls only and satisfies `react-hooks/immutability`, which flagged direct marker-property assignment inside an effect. One marker per `placeId`; `sync(cafes)` does keyed create/update(position)/remove; `gmp-click` → `onSelect(placeId)`; `setSelected(id, cafes)` swaps a `PinElement` on the selected marker, sets `zIndex`, and `map.panTo`s it; `destroy()` detaches every listener. `CafeMap` loads `importLibrary('marker')` lazily (only once a cafe exists) and creates the map with `mapId: clientEnv.googleMapsMapId`. **T06 behaviour preserved:** one script, one map instance, `setCenter` on centre change, `hidden`-toggled surface, `aria-label`-disambiguated status, graceful degradation.
  - **`DiscoveryPage`:** owns the single `useLocation()` + `useCafeSearch(resolvedCenter)` + `selectedCafeId`. Selection is reconciled to the current result set **by derivation** (`rawSelectedCafeId && cafes.some(...) ? rawSelectedCafeId : null`), not by an effect that writes state — same lint constraint T06 hit. List and map receive the same `Cafe[]` and the same derived `selectedCafeId`; `selectCafe` is a `useCallback([])`. A `<div class="discovery__results">` grid (1 col mobile, 2 col ≥60rem) holds list + map.
  - **Backend fixture mode (`apps/api`):** `env.ts` gains `CAFE_PROVIDER: z.enum(['live','fixture']).default('live')`; `main.ts` picks `FixtureCafeProvider` or `GooglePlacesProvider`. `FixtureCafeProvider` reads `tests/fixtures/nearby-cafes-happy.json` (via `import.meta.url`), parses it with the **existing** `GoogleSearchNearbyResponseSchema`, slices to `maxResults`, and maps with the **existing** `mapGooglePlaceToCafe` — identical normalization to live, distances relative to the real request centre, zero Google traffic. `GooglePlacesProvider`, the route, the field mask and error mapping are untouched. This implements the canonical but previously-unbuilt "Fixture mode" from [[Local Development Runbook]].
- **Config / env:**
  - `apps/web/src/env.ts`: `VITE_GOOGLE_MAPS_MAP_ID` added as a **required** string. `apps/web/.env.local` (gitignored) + `apps/web/.env.example` + root `.env.example` set `DEMO_MAP_ID`.
  - `apps/api/.env` (gitignored) sets `CAFE_PROVIDER=fixture`; `apps/api/.env.example` documents `live | fixture`.
  - [[Environment Contract]] and [[Local Development Runbook]] updated; no real credential added anywhere.
- **Changed:** `apps/web/src/env.ts` (+ `.env.example` files), `apps/web/src/map/CafeMap.tsx`, `apps/web/src/routes/DiscoveryPage.tsx`, `apps/web/src/styles/app.css` (discovery grid, cafe-card, search-state, `.visually-hidden` — plain CSS, no framework), `apps/api/src/{env.ts,main.ts}`, `apps/api/.env.example`, root `.env.example`. **New:** `apps/web/src/search/*` (4 modules + tests), `apps/web/src/cafes/*` (5 modules + tests), `apps/web/src/map/markerLayer.ts` (+ test), `apps/api/src/providers/fixtureCafeProvider.ts` (+ test), `tests/e2e/search.spec.ts`, `tests/fixtures/cafe-search-response-{happy,empty}.json`, `docs/10_DECISIONS/ADR-007 Cost-Safe Search Orchestration.md`.
- **Explicitly not changed / not implemented:** no filter/sort UI (T09 — `rankPreference` fixed at `DISTANCE`, OQ-008 carried); no favourites / `localStorage` / `/favorites` data (T10); no Places Autocomplete / geocoding (OQ-010); no Fastify rate limiter / Cloud quota / budget setup (BLK-003); no "Search this area" / map-pan search; no prefetch, no polling, no search history; `GooglePlacesProvider` / route / field mask / error mapping untouched; `openapi.yaml` unchanged (consumed, not modified).
- **RM0 cost-safety — every question answered NO for unintended provider requests:**

| Trigger | Provider request? | Evidence |
|---|---|---|
| React rerender (same centre) | **NO** | `useCafeSearch.test.tsx` "one request per committed center" (rerender ×2, still 1); `search.spec.ts` keyboard-select test (`searchCount === 1`) |
| Window focus | **NO** | `useCafeSearch.test.tsx` toggles `focusManager` → call count unchanged; `refetchOnWindowFocus: false` |
| Network reconnect | **NO** | same test toggles `onlineManager`; `refetchOnReconnect: false` |
| Component remount | **NO** | `useCafeSearch.test.tsx` "reuses cached result across a remount" — synchronous success, still 1 call; `refetchOnMount: false` |
| Map pan / zoom | **NO** | map centre is presentation only; nothing calls `useCafeSearch`; `search.spec.ts` map is blocked entirely and the list still loads |
| Marker / card selection | **NO** | selection is `selectedCafeId` client state; `markerLayer.test.ts` + `CafeMap.test.tsx` + `search.spec.ts` keyboard-select |
| Automatic retry after failure | **NO** | `retry: false`; `useCafeSearch.test.tsx` "does not retry automatically" (1 call after error); Retry button = exactly 1 more |
| Polling | **NO** | `refetchInterval: false`; no `setInterval` anywhere |
| Speculative prefetch | **NO** | no `queryClient.prefetchQuery`; one key only |
| Identical fresh query cache reuse | **YES (intended)** | `useCafeSearch.test.tsx` remount test — served from cache, no new call, within 5-min `staleTime` |

- **Commands run:**

| Command | Exact result |
|---|---|
| `node scripts/validate-brain.mjs` | PASSED — 22 required files, 75 governed notes, 75 unique note IDs, 0 unresolved wiki links (ADR-007 added) |
| `pnpm lint` | passed, 0 problems (one `react-hooks/immutability` error during development — resolved by extracting `MarkerLayer`, not by disabling the rule) |
| `pnpm format` | passed — `prettier --check .` clean |
| `pnpm typecheck` | passed — all 4 packages |
| `pnpm test` | passed — **194 tests**: contracts 24, domain 31, apps/web 99 (+47: apiClient 13, useCafeSearch 8, formatCafe 10, CafeList 6, SearchStatePanel 6, markerLayer 6, CafeMap 12 (6 kept + 6 marker/degradation), env +1), apps/api 40 (+5: fixture provider 3, env 2) |
| `pnpm build` | passed — `apps/web` 179 modules → `dist/` (css 5.59 kB, js 345.43 kB); `apps/api` `tsc` build |
| `pnpm e2e` | passed — **16/16** chromium (app-shell 5, location 5, search 6 — all with `page.route` fakes, Maps script `route.abort()`ed, zero Google traffic) |
| `pnpm dev` (all 4 processes, `CAFE_PROVIDER=fixture`) | clean cold start; `predev` built shared packages; vite `:5173` ready; api `Server listening at http://127.0.0.1:3001` |
| `curl http://localhost:3001/health` | `{"status":"ok"}` |
| `curl -X POST .../api/v1/cafes/search` (fixture mode, valid body) | 200 — normalized `CafeSearchResponse`: 3 cafes, computed `distanceMeters`, "Unrated Roastery" keeps no rating + `UNKNOWN` open status |
| `curl -X POST .../api/v1/cafes/search` (radiusMeters 99999) | 400 — server-side bounds still enforced (T05 preserved) |
| `grep -rn "GOOGLE_PLACES_SERVER_KEY\|places.googleapis\|X-Goog-Api-Key" apps/web/dist/` | no matches — server key absent from the browser build; `DEMO_MAP_ID` + browser-key placeholder present (expected) |

- **Data provenance during verification:** automated unit/component tests — mocked `apiClient` / mocked `google.maps`. E2e — `page.route` JSON fakes, Maps script aborted. Manual `pnpm dev` — **real Bean Stalker API with the fixture provider** (`CAFE_PROVIDER=fixture`), clearly not live Google. **No live Google Places or Maps request was made; no billing account created.**
- **Tests added/run:** see the `pnpm test` row. Key ones: `apiClient.test.ts` — POST path/body/content-type, signal forwarding, success + empty validation, error-envelope→typed error, malformed 200→`PROVIDER_BAD_RESPONSE`, non-envelope error→`INTERNAL_ERROR`, network→`PROVIDER_UNAVAILABLE`, `AbortError` re-thrown, out-of-contract rejected before fetch. `useCafeSearch.test.tsx` — no-location→0 requests, 1-per-centre + 1-per-new-centre, no focus/reconnect refetch, remount cache reuse, no auto-retry + explicit retry=+1, **TC-SEARCH-003** deferred-promise stale-race (late A never overwrites B). `markerLayer.test.ts` / `CafeMap.test.tsx` — one marker per cafe, keyed reconciliation, listener detach, click→select, selected restyle + `panTo`, map-failure ⇒ zero markers + contained error. `search.spec.ts` — full journey, keyboard select w/o refetch, list-survives-map-failure, empty≠error, retryable error, 375px no-overflow.
- **Known failures:** none outstanding.
- **Security / provider review:** `GOOGLE_PLACES_SERVER_KEY` is referenced only in `apps/api` (`main.ts`, `env.ts`, provider) — never under `apps/web` (`grep`-verified in source and in `dist/`). `apps/web` uses only `VITE_`-prefixed values (`VITE_API_BASE_URL`, `VITE_GOOGLE_MAPS_BROWSER_KEY`, `VITE_GOOGLE_MAPS_MAP_ID`) — all intentionally browser-visible. No coordinates persisted or logged client-side; no `.env`/secret committed (`apps/web/.env.local`, `apps/api/.env` are gitignored). `FixtureCafeProvider` cannot be selected in production (`CAFE_PROVIDER` defaults to `live`; `fixture` is documented dev/test-only).
- **Next safe task:** `T09` (local sort/filter controls) and `T10` (localStorage favourites) are both READY (`T02` + `T07` DONE) and independent of the credential blockers. `T08` (restricted-credential live provider smoke) is BLOCKED on [[Known Blockers|BLK-001]] / [[Known Blockers|BLK-003]]. Per the session's explicit instruction, stopping here — not starting T08/T09/T10.

---

### `T09` — Local sort/filter controls

- **Date:** 2026-08-28
- **Executor:** Claude Code
- **Starting commit:** `8259d83` (Record T07 implementation handoff evidence)
- **Ending commit:** `cfacf70` (Implement T09: local sort/filter controls)
- **RM0 invariant held:** T09 operates only on the already-fetched `Cafe[]`. No filter/sort value reaches `useCafeSearch`, the TanStack Query key or the `CafeSearchRequest` — `grep` of `apps/web/src/search/` finds zero references to `filter`/`sortBy`/`minRating`/`openNow`. Every control change (rating, Open Now, sort, Reset) and the filtered-empty state issue **0** `POST /api/v1/cafes/search` requests — asserted at integration level (`DiscoveryPage.test.tsx`, `searchCafes` call count stays 1) and e2e (`filters.spec.ts`, a live request counter stays 1).
- **OQ-008 RESOLVED:** [[Ranking and Filtering Rules]] bumped to v1.1 with the explicit tie-break — rating DESC → `userRatingCount` DESC (absent = 0) → `distanceMeters` ASC → stable order — confirming the T02 `sortCafes` implementation. No higher-authority source specified otherwise, so this is a rank-4 doc clarification, **not an ADR**. `sortCafes()` unchanged. [[Open Questions]] OQ-008 marked RESOLVED.
- **OQ-011 partially informed:** T09 fixed the local-UX defaults it owns (`DEFAULT_DISCOVERY_FILTERS = { minRating: 0, openNowOnly: false, sortBy: 'DISTANCE' }`; min-rating options Any/3+/3.5+/4+/4.5+) and deliberately added **no** search-radius or provider-rank control. `radiusMeters` / `maxResults` / `staleTime` remain T07 assumptions, still open.
- **Architecture:**
  - `apps/web` now depends on `@bean-stalker/domain` (`workspace:*`, added to `apps/web/package.json`; `pnpm install` linked it, `pnpm-lock.yaml` +3 lines). First frontend consumer of the domain package.
  - `apps/web/src/cafes/filterState.ts` — `DiscoveryFilters { minRating: number; openNowOnly: boolean; sortBy: CafeSortMode }`, `DEFAULT_DISCOVERY_FILTERS`, `MIN_RATING_OPTIONS`, `SORT_OPTIONS`, `isDefaultFilters()`, and the pure `applyDiscoveryFilters(cafes, filters)` = `sortCafes(filterCafes(cafes, { minRating, openNow }), sortBy)`. **Filter → sort.** Delegates entirely to `packages/domain`; reimplements no ranking/filtering; `filterCafes`/`sortCafes` both return fresh arrays so TanStack Query's cached `Cafe[]` is never mutated.
  - `apps/web/src/cafes/FilterBar.tsx` — `role="group" aria-label`, native `<select>` (Minimum rating), `<input type="checkbox">` (Open now only), native `<select>` (Sort by), and a Reset button `disabled` when `isDefaultFilters`. `useId`-linked visible `<label>`s; sort change is validated against `SORT_OPTIONS` (no `as` cast).
  - `apps/web/src/routes/DiscoveryPage.tsx` — `filters` is plain `useState`; `displayedCafes = useMemo(() => applyDiscoveryFilters(cafes, filters), [cafes, filters])`. Both `CafeList` and `CafeMap` receive `displayedCafes` + one shared `selectedCafeId`. `FilterBar` renders only when `view.status === 'success' && cafes.length > 0`.
  - **Selection reconciliation (two layers, no effect-setState):** (1) render-derivation — `selectedCafeId` = raw id only if present in `displayedCafes`, else `null` (covers a new search replacing `cafes`); (2) the `changeFilters` handler drops the raw id permanently when the change hides the selected cafe, so relaxing a filter later never silently re-selects it (§42).
  - **Filtered-empty ≠ API-empty:** `SearchStatePanel` keeps the API-empty copy ("No cafes were found near this location"); `DiscoveryPage` renders a distinct "No cafes match your current filters. Try relaxing them." (`role="status"`) when `cafes.length > 0 && displayedCafes.length === 0`.
  - `apps/web/src/cafes/CafeList.tsx` — optional `totalCount` prop; heading shows "X of Y cafes shown" when filtered, "Y cafes found" otherwise.
  - `apps/web/src/map/markerLayer.ts` — `MarkerLayer.setSelected` now tracks `lastPannedTo` and only `panTo`s on a genuine selection change, so a re-sort / filter change that leaves the same cafe selected does not move the map (§34). Marker reconciliation is still keyed by `placeId`: a sort re-order updates marker positions in place (no new markers); a filter removes/re-adds markers by id.
  - `apps/web/src/styles/app.css` — `.filter-bar` (flex-wrap row → column stack ≤30rem), field/label/select/reset styling. Plain CSS, no framework.
- **Changed:** `apps/web/package.json` (+`@bean-stalker/domain`), `pnpm-lock.yaml`, `apps/web/src/routes/DiscoveryPage.tsx`, `apps/web/src/cafes/CafeList.tsx`, `apps/web/src/map/markerLayer.ts`, `apps/web/src/styles/app.css`, `docs/02_DOMAIN/Ranking and Filtering Rules.md` (v1.1), execution/traceability docs. **New:** `apps/web/src/cafes/{filterState.ts,FilterBar.tsx}` (+ `filterState.test.ts`, `FilterBar.test.tsx`), `apps/web/src/routes/DiscoveryPage.test.tsx`, `tests/e2e/filters.spec.ts`.
- **Explicitly not changed / not implemented:** `apps/api`, `CafeProvider`/`GooglePlacesProvider`/`FixtureCafeProvider`, `/api/v1/cafes/search`, `openapi.yaml`, server env, the Google field mask, the TanStack Query key, `CafeSearchRequest`; no "favourites only" filter (needs T10); no radius/provider-rank control; no URL query-string state; no `localStorage` for filters (page refresh resets controls — acceptable for MVP); no T10/T08/deploy/Cloud config.
- **RM0 T09 evidence — every answer NO:**

| Question | Answer | Evidence |
|---|---|---|
| min-rating change triggers API search? | **NO** | `DiscoveryPage.test.tsx` "transforms … zero extra requests" (`searchCafes` count 1); `filters.spec.ts` counter 1 |
| Open Now toggle triggers API search? | **NO** | same tests, toggle on+off |
| sort change triggers API search? | **NO** | same tests, DISTANCE→RATING |
| Reset triggers API search? | **NO** | same tests, Reset click |
| filtered-empty triggers expansion/refetch? | **NO** | `DiscoveryPage.test.tsx` "distinguishes filtered-empty…" (count 1); e2e |
| sorting causes a speculative request? | **NO** | no `prefetchQuery`; sort only reorders `displayedCafes` |
| controls modify the TanStack queryKey? | **NO** | `grep apps/web/src/search/` → 0 filter/sort references; key derives only from the request built from `center` |
| controls modify `CafeSearchRequest`? | **NO** | same; `buildCafeSearchRequest(center)` takes only the centre |

- **Commands run:**

| Command | Exact result |
|---|---|
| `node scripts/validate-brain.mjs` | PASSED — 22 required files, 75 governed notes, 75 unique IDs, 0 unresolved wiki links |
| `pnpm lint` | passed, 0 problems |
| `pnpm format` | passed — `prettier --check .` clean |
| `pnpm typecheck` | passed — all 4 packages |
| `pnpm test` | passed — **214 tests**: contracts 24, domain 31, apps/web 119 (+20: `filterState` 9, `FilterBar` 7, `DiscoveryPage` 4), apps/api 40 |
| `pnpm build` | passed — `apps/web` vite build; `apps/api` tsc build |
| `pnpm e2e` | passed — **19/19** chromium (app-shell 5, location 5, search 6, filters 3) |
| `pnpm dev` (`CAFE_PROVIDER=fixture`, cold) | clean start — `predev` built shared packages; vite `:5173`; api `Server listening at http://127.0.0.1:3001`; contracts+domain watchers "Found 0 errors" |
| `curl http://localhost:3001/health` | `{"status":"ok"}` |
| `curl -X POST …/api/v1/cafes/search` (fixture) | 200 — 5 varied cafes (ratings 4.8/none/4.2/3.5/4.6; OPEN/UNKNOWN/CLOSED/UNKNOWN/OPEN) — a filterable dataset for manual verification |
| `grep -rn "GOOGLE_PLACES_SERVER_KEY\|places.googleapis\|X-Goog-Api-Key" apps/web/dist/` | no matches — server key absent from the browser build |
| `grep -rn "filter\|sortBy\|minRating\|openNow" apps/web/src/search/` | no matches — filter state never enters the search layer |

- **Data provenance during verification:** integration/component tests mock `searchCafes` and stub `CafeMap`; e2e uses `page.route` JSON fakes with the Maps script `route.abort()`ed; manual `pnpm dev` used `CAFE_PROVIDER=fixture`. **No live Google Places or Maps request; no billing account.**
- **Tests added/run:** `filterState.test.ts` (9) — defaults hide nothing / distance order, immutability, positive vs zero min-rating (unrated excluded / kept), Open Now (CLOSED **and** UNKNOWN out), combined = intersection, **OQ-008** tie-break against the canonical fixture (`C, B, A, E, D`), filter-then-sort, `isDefaultFilters`. `FilterBar.test.tsx` (7) — labelled native controls, each change reports the right next `DiscoveryFilters`, Reset disabled-at-default / returns the default triple, keyboard operable (Tab + Space). `DiscoveryPage.test.tsx` (4) — list+map stay in sync through rating/Open-Now/sort/Reset with `searchCafes` count 1; filtered-empty ≠ API-empty (count 1); selecting a CLOSED cafe then Open Now clears the selection and relaxing does not restore it; no FilterBar before results. `filters.spec.ts` e2e (3) — controls change the list with a request counter fixed at 1, filtered-empty message, 375px no overflow. **20 unit/component + 3 e2e; all pass.**
- **Known failures:** none outstanding.
- **Security / cost review:** no new env var, no backend change, no new Google field. Filter/sort state is local `useState` only — `grep`-verified absent from `apps/web/src/search/` and from `apps/web/dist` (server key also absent, re-checked). No coordinates or filter prefs persisted.
- **Next safe task:** `T10` (localStorage favourites) is the only unblocked READY task (`T02` + `T07` DONE). `T08` remains BLOCKED ([[Known Blockers|BLK-001]] / [[Known Blockers|BLK-003]]); `T11`/`T12` sit behind it. Per the session's explicit instruction, stopping here — not starting T10/T08/deploy.

---

### `T10` — localStorage favourites

- **Date:** 2026-08-28
- **Executor:** Claude Code
- **Starting commit:** `f8135e6` (Record T09 implementation handoff evidence)
- **Ending commit:** `52833ab` (Implement T10: localStorage favourites)
- **RM0 invariant held:** favourites are entirely browser-local. `apps/web/src/favorites/` has **zero** references to `searchCafes` / `useCafeSearch` / `CafeSearchRequest` / the TanStack Query key / `api/v1` (`grep`-verified). Add / remove / re-add a favourite, opening `/favorites`, reloading `/favorites`, and navigating Home↔Favorites all issue **0** `POST /api/v1/cafes/search` requests — asserted at integration level (`DiscoveryPage.test.tsx`, `searchCafes` call count stays 1) and e2e (`favorites.spec.ts`, a live request counter stays fixed across all favourite operations and the `/favorites` visit + reload). No `useQuery`/`useMutation` wraps localStorage.
- **Canonical fit:** implements [[ADR-004 Favorites Local Storage]] / [[Favorite Cafe Model]] / [[Data Model]]'s `FavoriteStoreV1` exactly — the T01 `FavoriteStoreSchema` (`{ version: z.literal(1), cafes: [{ placeId, savedAt, snapshot: CafeSchema }] }`) and the T02 pure helpers (`EMPTY_FAVORITE_STORE`, `isFavorite`, `addFavorite`, `removeFavorite`) are reused unchanged. Corrupt-storage handling follows [[Local State Recovery Runbook]]: parse through the versioned schema, preserve availability, never clear storage on read.
- **Architecture:**
  - `apps/web/src/favorites/favoritesStorage.ts` — the one owner of `FAVORITES_STORAGE_KEY = 'bean-stalker:favorites'`. `readFavoriteStore()` treats storage as untrusted: `getItem` in try/catch (thrown Storage exception → empty), `null` → empty, `JSON.parse` in try/catch (bad JSON → empty), `FavoriteStoreSchema.safeParse` (wrong shape **or** `version !== 1`, since the schema pins `z.literal(1)` → empty). A bad read is **never** rewritten. `writeFavoriteStore(store)` validates the shape, then `setItem` in try/catch, returning `{ ok: boolean }` instead of throwing.
  - `favoritesContext.ts` + `FavoritesProvider.tsx` + `useFavorites.ts` — shared persistent state. The provider hydrates **once** via a lazy `useState(() => initialStore ?? readFavoriteStore())` initializer (no effect, no flicker, no per-render parse) and exposes `favoriteIds: ReadonlySet<string>`, `favorites: FavoriteRecord[]`, `toggleFavorite(cafe)`, `removeFavorite(placeId)`, `persistenceError`. Mutators use the T02 helpers with **persist-then-commit**: compute the next store → `writeFavoriteStore` → only `setStore(next)` + clear the error if `ok`, otherwise set `persistenceError` and keep the previous state. The UI never claims a favourite is saved when the write failed. `useFavorites()` throws outside a provider (wiring bug, not silent inert value). `initialStore` is a test seam.
  - `FavoriteButton.tsx` — a native `<button type="button" aria-pressed={favorited} aria-label={favorited ? 'Remove <name> from favourites' : 'Add <name> to favourites'}>` with an `aria-hidden` glyph (★/☆) **and** a text label ("Saved"/"Save") — state is not colour-only. Always a **sibling** of the card select button / Maps link, never nested.
  - `CafeSummary.tsx` (new) — the shared, control-free cafe presentation (meta / address / Maps link) extracted from T07's `CafeCard`, with a `showDistance` prop (off on `/favorites`, where a snapshot's `distanceMeters` has no reference point). `CafeCard.tsx` restructured: `<li>` → `.cafe-card__header` (select `<button>` + `<FavoriteButton>` as siblings) → a sibling "Selected" `<span>` (moved **out** of the select button so its accessible name stays exactly the cafe name) → `<CafeSummary>`. T07 selection semantics preserved.
  - `FavoritesPage.tsx` — the real page: reads only `useFavorites().favorites`, no location / no search / no `CafeMap`. Populated state = a page-level local-only + staleness note + `<ul aria-label="Saved cafes">` of `<li>` (`CafeSummary` from the snapshot with `showDistance={false}` + a "Saved `<date>`" line + a `FavoriteButton` that removes). Empty state = "No favourites saved yet" + a link home ("Find cafes to save" — deliberately not containing "Discover", to keep the nav link unambiguous). Removing the last favourite returns the empty state in place, no reload.
  - `FavoritePersistenceNotice.tsx` — a bounded `role="alert"` mounted in `AppShell` that renders only when `persistenceError` is set; favourite-specific copy, never a raw exception, never a cafe-search error.
  - `main.tsx` — `<FavoritesProvider>` wraps `<App>` inside `QueryClientProvider`.
- **CafeCard two-button disambiguation:** the select button and the favourite button are both `<button aria-pressed>` on the same card. The select button's accessible name is now exactly the cafe name (the "Selected" flag moved out); the favourite button's is "Add/Remove `<name>` …". Existing T07/T09 tests + `search.spec.ts` / `filters.spec.ts` were updated to target the select button by exact name (`{ name, exact: true }` in Playwright; a bare string `name` is already exact in RTL) or by `.cafe-card__name`.
- **Changed:** `apps/web/src/cafes/CafeCard.tsx` (restructured), `apps/web/src/components/AppShell.tsx` (+notice), `apps/web/src/main.tsx` (+provider), `apps/web/src/routes/FavoritesPage.tsx` (rewritten), `apps/web/src/styles/app.css` (favourite button, favorites page, notice; plain CSS). Test updates: `App.test.tsx`, `cafes/CafeList.test.tsx`, `routes/DiscoveryPage.test.tsx`, `tests/e2e/{search,filters}.spec.ts`. Execution/traceability docs. **New:** `apps/web/src/favorites/*` (7 modules), `apps/web/src/cafes/CafeSummary.tsx`, `apps/web/src/routes/FavoritesPage.test.tsx`, `tests/e2e/favorites.spec.ts`.
- **Explicitly not changed / not implemented:** `apps/api` (nothing — favourites are browser-only), `openapi.yaml`, the Google field mask, server env, `packages/contracts` / `packages/domain` (schema + helpers reused unchanged), T09 filter state; no cross-tab `storage`-event sync, no search-history / SearchCenter / filter-prefs persistence, no "favourites only" Discovery filter ([[Open Questions|OQ-012]]), no `useMutation`/`useQuery` for storage, no IndexedDB, no T08/deploy/PWA/rename.
- **RM0 T10 evidence — every answer NO:**

| Question | Answer | Evidence |
|---|---|---|
| favorite add causes search? | **NO** | `DiscoveryPage.test.tsx` "add/remove/re-add … no cafe-search request" (`searchCafes` count 1); `favorites.spec.ts` counter fixed |
| favorite remove causes search? | **NO** | same |
| /favorites causes search? | **NO** | `FavoritesPage.test.tsx` (no `searchCafes` import/call, no map, no location); `favorites.spec.ts` visits `/favorites`, counter unchanged |
| reload /favorites causes search? | **NO** | `favorites.spec.ts` `page.reload()` on `/favorites`, counter unchanged |
| favorite toggle changes queryKey? | **NO** | `grep apps/web/src/favorites/` → 0 references to the query key / `useCafeSearch` |
| favorite toggle changes CafeSearchRequest? | **NO** | same |
| FavoritesPage contacts Google? | **NO** | renders persisted snapshots only; e2e blocks `maps.googleapis.com` and the page is fully usable |

- **Commands run:**

| Command | Exact result |
|---|---|
| `node scripts/validate-brain.mjs` | PASSED — 22 required files, 75 governed notes, 75 unique IDs, 0 unresolved wiki links |
| `pnpm lint` | passed, 0 problems |
| `pnpm format` | passed — `prettier --check .` clean |
| `pnpm typecheck` | passed — all 4 packages |
| `pnpm test` | passed — **236 tests**: contracts 24, domain 31, apps/web **141** (+22: `favoritesStorage` 8, `FavoriteButton` 6, `FavoritesProvider` 2, `FavoritesPage` 4, `DiscoveryPage` +2), apps/api 40 |
| `pnpm build` | passed — `apps/web` vite build; `apps/api` tsc build |
| `pnpm e2e` | passed — **23/23** chromium (app-shell 5, location 5, search 6, filters 3, favorites 4) |
| `pnpm dev` (`CAFE_PROVIDER=fixture`, cold) | clean start — `predev` built shared packages; vite `:5173`; api `Server listening at http://127.0.0.1:3001`; contracts+domain watchers "Found 0 errors" |
| `curl http://localhost:3001/health` | `{"status":"ok"}` |
| `curl -X POST …/api/v1/cafes/search` (fixture) | 200 — 5 varied cafes; a filterable/favouritable dataset |
| `grep -rn "GOOGLE_PLACES_SERVER_KEY\|places.googleapis\|X-Goog-Api-Key" apps/web/dist/` | no matches |
| `grep -rn "searchCafes\|useCafeSearch\|CafeSearchRequest\|queryKey\|api/v1" apps/web/src/favorites/` | no matches |
| `grep -rn "SearchCenter\|requestId\|GOOGLE" apps/web/src/favorites/` | no matches — storage holds only cafe snapshots |

- **Data provenance during verification:** unit/component tests use jsdom `localStorage` + mocked `searchCafes` + stubbed `CafeMap`; storage-exception tests `vi.spyOn(Storage.prototype, …)`. E2e uses `page.route` JSON fakes with `maps.googleapis.com` aborted and real browser `localStorage` across `page.reload()`. Manual `pnpm dev` used `CAFE_PROVIDER=fixture`. **No live Google Places or Maps request; no billing account.**
- **Tests added/run:** `favoritesStorage.test.ts` (8) — empty read, valid round-trip, invalid JSON (+ corrupt value left untouched), wrong schema, unsupported `version: 999`, `getItem` throws → empty, `setItem` throws → `{ ok: false }`, invalid store rejected not persisted. `FavoriteButton.test.tsx` (6) — unpressed "add" name, aria-pressed + name + label cycle both ways, keyboard (`{Enter}`), persists through the storage boundary, two buttons for one cafe stay in sync with one record. `FavoritesProvider.test.tsx` (2) — hydrate-once so a favourite survives a remount; write-failure → UI not flipped, storage unchanged, bounded `role="alert"`. `FavoritesPage.test.tsx` (4) — accessible empty state w/ link home + no list, populated semantic list w/ note + no distance, remove-in-place incl. last→empty, no map / no location. `DiscoveryPage.test.tsx` (+2) — favourited membership persists across filter/sort with `searchCafes` count 1 and no selection/pan; add/remove/re-add → count 1. `CafeList.test.tsx` (+1) — favourite button is a sibling, not nested. e2e `favorites.spec.ts` (4) — reload persistence + `/favorites` shows the snapshot + no search across favourites ops; remove-last → empty state; `/favorites` works with no location and no map; 375px favourite controls no overflow. **22 unit/component + 4 e2e; all pass.**
- **Known failures:** none outstanding. (Three existing e2e failed mid-work on the two-button name collision and the empty-state link text — both fixed within T10, not deferred.)
- **Security / privacy / cost review:** `FavoriteStore` contains only `{ version, cafes: [{ placeId, savedAt, snapshot: Cafe }] }` — no `SearchCenter`/user coordinates ([[Privacy Boundaries]]: favourites may hold *public place* coordinates), no request IDs, no provider payloads/errors, no credentials. No analytics/server logs/account identifiers for favourite data. Server Places key still absent from `apps/web/dist` (re-checked). No `.env`/secret committed (`apps/web/.env.local`, `apps/api/.env` gitignored, untouched).
- **New open question recorded:** [[Open Questions|OQ-012]] — a "favourites only" toggle on the Discovery `FilterBar` ([[Ranking and Filtering Rules]] lists `favourite` as a filter; FR-014 says "view/filter"). T10 delivered the *view* (`/favorites`) and the membership state but not a Discovery filter control — flagged rather than silently dropped, to decide at T12 or a follow-up.
- **Next safe task:** **none is READY.** T09 and T10 completed the [[MVP Scope]] P0 feature set. `T11`–`T15` are all gated on `T08`, which is BLOCKED on [[Known Blockers|BLK-001]] / [[Known Blockers|BLK-003]] (developer must configure a Google Cloud project + restricted credentials + quotas + budget alert). Per the session's explicit instruction, stopping here — not starting T08 or release/deploy/PWA work.
