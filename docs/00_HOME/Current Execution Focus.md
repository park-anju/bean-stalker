---
id: HOME-CURRENT-EXECUTION-FOCUS
type: execution-state
status: approved
version: 1.2
authority: execution
owner: Project Owner
updated: 2026-09-19
---
# Current Execution Focus

## Active objective

**The pre-T08 hardening + documentation chain H02–H11 is complete.** H11 replaced raw coordinate entry with automatic, session-scoped browser geolocation on Discover, automatic use of the existing cafe query after success, bounded permission/error states, and explicit retry. A follow-up browser audit made Web Geolocation authoritative instead of gating on the Permissions API and added an explicit insecure-context state. The browser-specific acquisition remains behind `GeolocationAdapter`; precise centers remain memory-only. There is no human-friendly manual fallback yet. Fixture/mock tests cover prompt/pending, granted, already-available location, Permissions API missing, denied/unavailable/timeout/unsupported/insecure, retry, Strict Mode/rerender deduplication, coordinate UI removal, mobile/keyboard and axe states. **0 real Google Places requests.** No task is IN_PROGRESS.

## Next actionable step

- **No `H`- or `T`-task is `READY`.** Everything that remains (`T08` live smoke, then `T11`–`T15`) is gated on `T08`.
- `T08` is **BLOCKED** on [[Known Blockers|BLK-001]] / [[Known Blockers|BLK-003]] / [[Known Blockers|BLK-004]] — Google Cloud project, restricted credentials, quotas, budget alert; and before public release, a durable/shared usage guard + `trustProxy`/HSTS topology.
- The next step is a **human decision**: provision Google Cloud to unblock `T08`, or accept the project as a fixture-verified portfolio artefact.
- Deferred packaging: portfolio screenshots / demo GIF, a repository `LICENSE`, the Google Maps Platform attribution/ToS pre-deployment check.
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
