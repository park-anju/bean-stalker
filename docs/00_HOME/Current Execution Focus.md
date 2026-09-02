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

The pre-T08 hardening milestone (H02–H05, [[ADR-008 Metered Provider Cost Controls]]) is DONE: privacy-safe Fastify logging (no client IP, no coordinates, no request bodies, no raw payloads), a per-client rate limit on the search route (429 `RATE_LIMITED`), a global fail-closed metered-provider usage guard abstraction with an in-memory implementation (503 `PROVIDER_CAPACITY_EXHAUSTED`, consume-before-dispatch, no refund on failure), and graceful bounded frontend behaviour for both conditions. All verified against fixtures/mocks with **0 real Google requests**. No task is IN_PROGRESS.

## Next READY tasks

**None.** T09, T10 and H02–H05 were the last unblocked work. `T11`–`T15` are all gated on `T08`.

- `T08` — restricted-credential live provider smoke — BLOCKED on [[Known Blockers|BLK-001]] and [[Known Blockers|BLK-003]]. It needs the developer to create a Google Cloud project, enable only the required Maps Platform APIs, configure restricted browser + server credentials, set a budget/usage alert, and keep secrets out of source control (the prerequisites below).
- Before **public release** (not T08): a durable/shared production usage-guard implementation ([[Known Blockers|BLK-004]]) and `trustProxy` configuration for the chosen deployment topology.
- One minor deferred item, [[Open Questions|OQ-012]] — a "favourites only" Discovery filter — is not on the critical path.

## Immediate human prerequisites

1. Create or select a Google Cloud project.
2. Enable only the required Maps Platform APIs.
3. Configure restricted browser and server credentials according to [[API Key Boundaries]].
4. Set a budget/usage alert appropriate to the project.
5. Keep secrets outside source control.

## Scope discipline

Do not add accounts, cloud-synced favourites, reviews, recommendations, social features, payments, admin tooling, a database, or microservices during the three-day MVP unless [[MVP Scope]] is explicitly revised.
