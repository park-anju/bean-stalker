---
id: HOME-CURRENT-EXECUTION-FOCUS
type: execution-state
status: approved
version: 1.0
authority: execution
owner: Project Owner
updated: 2026-08-27
---
# Current Execution Focus

## Active objective

T05 (Fastify cafe search + Google provider adapter) is DONE. A review checkpoint is expected before the next task begins — see [[Task Status]].

## Next READY tasks

- `T06` — Maps JavaScript map integration (dependency T03 satisfied)

`T07` (search orchestration) remains PENDING until `T06` is also DONE (`T04`, `T05` are already DONE).

`T09`/`T10` (which will wire up T02's `packages/domain` helpers) remain PENDING until `T07` is also DONE.

## Immediate human prerequisites

1. Create or select a Google Cloud project.
2. Enable only the required Maps Platform APIs.
3. Configure restricted browser and server credentials according to [[API Key Boundaries]].
4. Set a budget/usage alert appropriate to the project.
5. Keep secrets outside source control.

## Scope discipline

Do not add accounts, cloud-synced favourites, reviews, recommendations, social features, payments, admin tooling, a database, or microservices during the three-day MVP unless [[MVP Scope]] is explicitly revised.
