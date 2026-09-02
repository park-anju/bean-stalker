---
id: HOME-CURRENT-EXECUTION-FOCUS
type: execution-state
status: approved
version: 1.1
authority: execution
owner: Project Owner
updated: 2026-09-03
---
# Current Execution Focus

## Active objective

Hardening milestones **H06** (secrets & configuration) and **H07** (backend security) are DONE, on top of H02–H05. New: fail-closed live env validation (`GOOGLE_PLACES_SERVER_KEY` + `PROVIDER_MONTHLY_REQUEST_LIMIT` required only in `live`; fixture mode credential-free), a shared bare-origin validator for `WEB_ORIGIN`/`VITE_API_BASE_URL`, a bounded provider timeout, a build-time frontend-secret scan, strict single-origin CORS + `nosniff`/`no-referrer`/`X-Frame-Options: DENY` headers, a 16 KiB body limit + 20 s request timeout (both rejecting before the provider/usage guard), and a canonical `NOT_FOUND` 404. [[ADR-009 API Security Posture]] records the decisions. All verified against fixtures/mocks with **0 real Google requests**. No task is IN_PROGRESS.

## Next READY tasks

- **`H08` — Mobile & accessibility QA.** Dependency `H07` `DONE`. Needs no Google credentials — device/viewport and a11y verification of the existing fixture-backed app. This is the next actionable task.
- `H09` (architecture docs) and `H10` (portfolio README) are `PENDING` behind H08.
- `T08` — restricted-credential live provider smoke — still BLOCKED on [[Known Blockers|BLK-001]] / [[Known Blockers|BLK-003]]. `T11`–`T15` are gated on it.
- Before **public release** (not T08): a durable/shared production usage guard ([[Known Blockers|BLK-004]]), `trustProxy`/HSTS for the chosen topology, Google-side quotas/budget/key restrictions.
- Deferred, non-critical: [[Open Questions|OQ-012]] (favourites-only filter), [[Open Questions|OQ-013]] (immediate Retry on capacity exhaustion).

## Immediate human prerequisites

1. Create or select a Google Cloud project.
2. Enable only the required Maps Platform APIs.
3. Configure restricted browser and server credentials according to [[API Key Boundaries]].
4. Set a budget/usage alert appropriate to the project.
5. Keep secrets outside source control.

## Scope discipline

Do not add accounts, cloud-synced favourites, reviews, recommendations, social features, payments, admin tooling, a database, or microservices during the three-day MVP unless [[MVP Scope]] is explicitly revised.
