---
id: EXEC-HANDOFFS
type: execution-state
status: approved
version: 1.0
authority: execution
owner: Project Owner
updated: 2026-08-27
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
