---
id: QA-RELEASE-READINESS
type: quality-spec
status: approved
version: 1.1
authority: canonical
owner: Project Owner
updated: 2026-09-03
---
# Release Readiness

## P0 release checklist

### Scope
- [ ] All P0 functions in [[MVP Scope]] are implemented or explicitly removed by approved scope change.
- [ ] No P1/P2 feature blocks core flow.

### Security/cost
- [x] No real secret exists in tracked files or build output — git history checked (H06); `pnpm --filter @bean-stalker/web build` runs `scripts/check-frontend-dist-secrets.mjs` (fails on a server-only marker in `dist/`).
- [x] Fail-closed live config — `CAFE_PROVIDER=live` fails validation without `GOOGLE_PLACES_SERVER_KEY` + `PROVIDER_MONTHLY_REQUEST_LIMIT` (H06); fixture mode is credential-free.
- [x] Per-client rate limit (H03) + global fail-closed usage guard (H04) + graceful 429/503 (H05).
- [x] Strict single-origin CORS; `nosniff` / `no-referrer` / `X-Frame-Options: DENY`; 16 KiB body limit; 20 s request timeout; canonical `NOT_FOUND`; no error-detail leakage (H07 / [[ADR-009 API Security Posture]]).
- [x] Field mask is explicit/minimal.
- [x] Search radius/result count are bounded server-side.
- [ ] Browser Maps key has website + API restrictions — **Google-side, BLK-003**.
- [ ] Server Places key is server-only and API/IP-restricted — server-only ✅; Google-side API/IP restriction **BLK-003**.
- [ ] Google Cloud daily quota caps + budget/usage alert — **BLK-003**.
- [ ] **Durable/shared** production usage-guard implementation — in-memory only, **BLK-004**.
- [ ] `trustProxy` + HSTS configured for the chosen deployment topology — **BLK-003**.

### Behaviour
- [ ] Geolocation denial → manual location works.
- [ ] Live search returns real cafe data.
- [ ] Empty vs error are distinct.
- [ ] Missing optional fields display honestly.
- [ ] List/map selection is coherent.
- [ ] Sort/filter/favourites work.

### Quality
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build` (includes `scripts/check-frontend-dist-secrets.mjs`)
- [ ] `pnpm e2e`
- [ ] `node scripts/validate-brain.mjs`
- [ ] responsive smoke test (H08)
- [ ] keyboard/accessibility smoke test (H08)

### Documentation
- [ ] README has setup, env variables, architecture and demo.
- [ ] [[Current Project State]] reflects reality.
- [ ] [[Traceability Matrix]] has evidence links/status.
- [ ] [[Implementation Handoffs]] records final commands/results.
- [ ] Screenshots/GIF added for resume/GitHub if desired.

## Release decision

**Current:** NOT READY — implementation not yet started.
