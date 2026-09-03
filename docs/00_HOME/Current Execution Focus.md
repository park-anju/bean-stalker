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

**The full pre-T08 hardening + documentation chain H02–H10 is complete.** H10 (final of the chain) rewrote the root `README.md` from an internal vault-pointer into a public-facing portfolio entry — product framing, features, engineering highlights, one simplified Mermaid runtime diagram linking [[System Architecture]], honest status + known-limitations, fixture-mode setup — and fixed two `.env.example` defects that broke the documented `pnpm dev` copy-and-run path (blank `VITE_GOOGLE_MAPS_BROWSER_KEY`; present-but-empty `GOOGLE_PLACES_SERVER_KEY`). No runtime code changed. `pnpm dev` from the copied examples now starts both apps clean. **0 real Google Places requests.** No task is IN_PROGRESS.

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
