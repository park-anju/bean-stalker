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

**Phase:** T00 workspace bootstrap complete; no product features implemented.

The Bean Stalker vault structure, product baseline, architecture plan, interface contract, test strategy, demo scenario and execution graph are defined. T00 established the pnpm/TypeScript workspace, a placeholder React web shell, a minimal Fastify API, and working quality tooling. No cafe-discovery product behaviour is claimed by this package.

## What exists now

- governed Obsidian brain with resolvable wiki-links;
- pnpm workspace (`apps/web`, `apps/api`, `packages/contracts`) with shared `tsconfig.base.json`, flat ESLint config and Prettier;
- `apps/web`: Vite + React 19 + TypeScript, React Router with placeholder `/` and `/favorites` routes, TanStack Query provider wired but unused, Vitest + React Testing Library smoke tests;
- `apps/api`: Fastify server with a `/health` endpoint, CORS restricted to `WEB_ORIGIN`, graceful SIGINT/SIGTERM shutdown, Vitest test via `app.inject`;
- `packages/contracts`: package/tsconfig scaffold only, no Zod contracts yet (T01 scope);
- root Playwright e2e config (`tests/e2e/`) with a smoke test against the placeholder shell;
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm e2e` all run real tooling and pass;
- git repository initialized; brain baseline and T00 bootstrap are separate commits;
- deterministic brain validation script (still passing).

## What does not exist yet

- Google Places integration or provider adapter (T05);
- geolocation/manual location resolution (T04);
- cafe search, map, filters, favourites (T04–T10);
- shared Zod contracts and env validation (T01);
- actual Google Maps credentials or billing configuration;
- deployed app;
- verified live Nearby Search requests;
- screenshots or resume evidence.

## Intended P0 outcome

A user can select a location or grant geolocation, retrieve nearby cafes from live Google Maps Platform data, view results on list/map, filter/sort them, inspect useful details, save favourites locally, and recover cleanly from permission/API failures.

## Next safe action

Review [[Environment Contract]] and [[API Key Boundaries]], then start [[Task Status|T01]] (shared contracts and env validation). A review checkpoint is expected before T01 begins.
