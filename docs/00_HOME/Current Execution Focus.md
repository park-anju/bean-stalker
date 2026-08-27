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

T10 (localStorage favourites) is DONE — a versioned `bean-stalker:favorites` store behind a Zod-validated storage boundary, shared via `FavoritesProvider` (persist-then-commit), `FavoriteButton` on every result card (sibling, never nested), and a real `/favorites` page. Favourites are entirely browser-local: 0 provider requests, nothing reaches Fastify/Google. This completes the [[MVP Scope]] P0 feature set. No task is IN_PROGRESS.

## Next READY tasks

**None.** T09 and T10 were the last unblocked tasks. `T11`–`T15` are all gated on `T08`.

- `T08` — restricted-credential live provider smoke — BLOCKED on [[Known Blockers|BLK-001]] and [[Known Blockers|BLK-003]]. It needs the developer to create a Google Cloud project, enable only the required Maps Platform APIs, configure restricted browser + server credentials, set a budget/usage alert, and keep secrets out of source control (the five prerequisites below).
- One minor deferred item, [[Open Questions|OQ-012]] — a "favourites only" Discovery filter — is not on the critical path.

## Immediate human prerequisites

1. Create or select a Google Cloud project.
2. Enable only the required Maps Platform APIs.
3. Configure restricted browser and server credentials according to [[API Key Boundaries]].
4. Set a budget/usage alert appropriate to the project.
5. Keep secrets outside source control.

## Scope discipline

Do not add accounts, cloud-synced favourites, reviews, recommendations, social features, payments, admin tooling, a database, or microservices during the three-day MVP unless [[MVP Scope]] is explicitly revised.
