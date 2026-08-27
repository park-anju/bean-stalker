---
id: HOME-CURRENT-EXECUTION-FOCUS
type: execution-state
status: approved
version: 1.0
authority: execution
owner: Project Owner
updated: 2026-08-28
---
# Current Execution Focus

## Active objective

T09 (local sort/filter controls) is DONE — minimum-rating + Open Now filters and Distance/Rating sort operate entirely on the fetched `Cafe[]` via T02's helpers, with zero additional provider requests. [[Open Questions|OQ-008]] is resolved. No task is IN_PROGRESS; the executor stopped after T09 as instructed rather than starting T10/T08.

## Next READY tasks

- `T10` — localStorage favourites (dependencies `T02`, `T07` DONE) — READY, not started. The only unblocked task. Will wire T02's `isFavorite`/`addFavorite`/`removeFavorite`, add a versioned `localStorage` envelope, favourite toggles on `CafeCard`, and populate `/favorites`.

`T08` (restricted-credential live provider smoke) is BLOCKED on [[Known Blockers|BLK-001]] and [[Known Blockers|BLK-003]] despite its dependency `T07` being DONE; `T11`/`T12` sit behind it.

## Immediate human prerequisites

1. Create or select a Google Cloud project.
2. Enable only the required Maps Platform APIs.
3. Configure restricted browser and server credentials according to [[API Key Boundaries]].
4. Set a budget/usage alert appropriate to the project.
5. Keep secrets outside source control.

## Scope discipline

Do not add accounts, cloud-synced favourites, reviews, recommendations, social features, payments, admin tooling, a database, or microservices during the three-day MVP unless [[MVP Scope]] is explicitly revised.
