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

Hardening milestone **H08** (mobile & accessibility QA) is DONE, on top of H02–H07. A corrective-polish pass on the existing fixture-backed app — no new features, no backend change: darkened `--color-accent` to clear WCAG 2.1 AA contrast for link/button text; enlarged the "Open now only" checkbox to the WCAG 2.2 24 px target-size minimum; split location errors into an assertive `role="alert"` with `aria-invalid`/`aria-describedby` field association; added an API-empty `role="status"`; added `@axe-core/playwright` (dev-only) with a zero-violation scan of 9 states, plus a 320 px / long-content / geolocation-denied / keyboard-only Playwright suite. `OQ-013` reviewed, left open. **0 real Google requests.** No task is IN_PROGRESS.

## Next READY tasks

- **`H09` — Architecture documentation.** Dependency `H08` `DONE`. Needs no Google credentials. This is the next actionable task.
- `H10` (portfolio README) is `PENDING` behind H09.
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
