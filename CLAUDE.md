# Bean Stalker Agent Constitution

## Mission

Build Bean Stalker into a polished, interview-defensible cafe discovery MVP without hiding Google Maps Platform cost/security constraints or inventing features that are not in the approved scope.

## Mandatory startup route

Read these in order before substantial work:

1. `docs/00_HOME/Current Project State.md`
2. `docs/00_HOME/Current Execution Focus.md`
3. `docs/00_HOME/Source of Truth Map.md`
4. the task-specific canonical notes linked from the active task

## Context routing

- Product/scope → `docs/01_BUSINESS/BRD.md`, `MVP Scope.md`
- Cafe/search semantics → `docs/02_DOMAIN/`
- Observable behaviour → `docs/03_REQUIREMENTS/`
- API keys/privacy/external limits → `docs/04_AUTHORITY/`
- Architecture/data → `docs/05_ARCHITECTURE/`
- HTTP/UI contracts → `docs/06_INTERFACES/`
- Security/data/dependency governance → `docs/07_GOVERNANCE/`
- Tests/release → `docs/08_QUALITY/`
- Tasks/handoffs → `docs/09_EXECUTION/`
- Significant technical decisions → `docs/10_DECISIONS/`
- Demo → `docs/12_DEMO/`
- Runbooks → `docs/13_OPERATIONS/`

## Source precedence

Use [[Source of Truth Map]]. Never resolve contradictions silently. Record material ambiguity in [[Open Questions]].

## Non-negotiable invariants

1. Never commit real Google Maps Platform secrets.
2. Never expose a server-side Places web-service credential to the browser.
3. Browser-visible Maps JavaScript keys must be deliberately restricted by application/API restrictions.
4. Do not request `*` Places fields in production; use an explicit minimal field mask.
5. A denied geolocation permission must not make the app unusable: manual location selection remains available.
6. Do not claim a cafe is open unless the returned data supports the claim; represent unknown explicitly.
7. Do not fabricate ratings, addresses, opening status, prices, distance, or live availability.
8. Favourites are local-device state in MVP. Do not imply cloud sync or an account exists.
9. External API failures must produce a usable error state, not an empty-success illusion.
10. Do not mark implementation tasks complete without actual validation evidence.

## P0 engineering baseline

- pnpm workspace
- TypeScript
- React + Vite (`apps/web`)
- React Router
- TanStack Query
- Google Maps JavaScript API for interactive map UI
- Fastify (`apps/api`) for server-side Places API (New) calls
- Zod contracts in `packages/contracts`
- localStorage for favourites
- Vitest / React Testing Library / Playwright

Use separate credentials for browser Maps JavaScript usage and server-side Places web-service usage. Do not invent exact package versions before bootstrap.

## Task protocol

Before work:
- use `/start-task <TASK-ID>` or follow its skill contract;
- confirm dependencies are `DONE`;
- read only the linked canonical notes needed;
- state assumptions and exclusions.

After work:
- run required validation;
- update [[Traceability Matrix]] where implementation evidence exists;
- update [[Implementation Handoffs]], [[Current Project State]] and [[Task Status]];
- record significant divergence with `/record-decision`.

## Validation commands

Documentation baseline:

```bash
node scripts/validate-brain.mjs
```

After bootstrap:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```

Never claim a command passed unless it was actually executed successfully.
