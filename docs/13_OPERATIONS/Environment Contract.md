---
id: OPS-ENVIRONMENT-CONTRACT
type: runbook
status: approved
version: 1.1
authority: canonical
owner: Project Owner
updated: 2026-09-03
---
# Environment Contract

## Runtime baseline

- Node.js 20+ planning baseline;
- pnpm workspace;
- modern evergreen browser;
- Google Cloud project for live provider integration.

## Full inventory (H06 / [[ADR-009 API Security Posture]])

`sensitivity`: **public config** (browser-visible by design) · **operational
config** (validated behaviour tuning) · **SECRET** (server-only).

### Web (`apps/web/.env.local` ← `apps/web/.env.example`)

| Var | Owner | Sensitivity | Required in | Default | Validation |
|---|---|---|---|---|---|
| `VITE_API_BASE_URL` | web | public config | dev, test, prod | — | bare http(s) origin (`HttpOriginSchema`); trailing `/` normalised; no path/query |
| `VITE_GOOGLE_MAPS_BROWSER_KEY` | web | public config | dev, test, prod | — | non-empty string |
| `VITE_GOOGLE_MAPS_MAP_ID` | web | public config | dev, test, prod | — | non-empty string (`DEMO_MAP_ID` for local/test; real referrer-restricted Map ID for a deployed build) |

All three are inlined into the browser bundle by Vite. The Maps key and Map ID
are browser-visible **by design** — protected Google-side by referrer + API
restrictions (BLK-003), **not** by being hidden. None is a secret.

### API (`apps/api/.env` ← `apps/api/.env.example`)

| Var | Owner | Sensitivity | Required in | Default | Validation |
|---|---|---|---|---|---|
| `PORT` | api | operational config | all | — | int 1–65535 |
| `WEB_ORIGIN` | api | operational config | all | — | bare http(s) origin (`HttpOriginSchema`); the single CORS allow-origin |
| `GOOGLE_PLACES_SERVER_KEY` | api | **SECRET** | **live only** | — | non-empty string; **required when `CAFE_PROVIDER=live`**, must be absent-friendly in fixture mode; never `VITE_`-prefixed; never logged; never in the frontend build |
| `GOOGLE_PLACES_TIMEOUT_MS` | api | operational config | live (unused in fixture) | `10000` | int 100–30000 (bounded so an absurd value cannot hold a request open) |
| `CAFE_PROVIDER` | api | operational config | all | `live` | `live` \| `fixture` |
| `LOG_LEVEL` | api | operational config | all | `info` | pino level enum |
| `SEARCH_RATE_LIMIT_MAX` | api | operational config | all | `10` | int ≥ 1 |
| `SEARCH_RATE_LIMIT_WINDOW_MS` | api | operational config | all | `60000` | int ≥ 1000 |
| `PROVIDER_MONTHLY_REQUEST_LIMIT` | api | operational config | **live only** | — | int ≥ 0; **required when `CAFE_PROVIDER=live`**; `0` = fully fail-closed |

### Fail-closed live configuration

`CAFE_PROVIDER=live` **fails startup validation** without both
`GOOGLE_PLACES_SERVER_KEY` and `PROVIDER_MONTHLY_REQUEST_LIMIT`.
`CAFE_PROVIDER=fixture` requires neither — routine local dev needs no
credential and no billing. `CAFE_PROVIDER` still **defaults to `live`**, so an
env with only `PORT`/`WEB_ORIGIN` fails closed rather than silently serving
without a cost cap. Validation errors print `field: reason` and **never** the
offending value.

## Rules

- validate env at startup; fail closed on missing live config;
- secrets never have fake production defaults; `GOOGLE_PLACES_SERVER_KEY` is the
  only secret and is optional at the schema level (live-required by refinement);
- `.env.example` contains names/placeholders and a sensitivity classification
  comment only — never a real value; there is **no root `.env`** (each app owns
  its own; the root `.env.example` is a pointer);
- server key never uses `VITE_` prefix; the frontend build scans `dist/` for
  server-only markers and fails on a hit (`scripts/check-frontend-dist-secrets.mjs`);
- production origins are explicit; `WEB_ORIGIN` / `VITE_API_BASE_URL` must be a
  bare origin;
- `trustProxy` stays at its default (`false`) until deployment defines the
  trusted reverse-proxy hop — `request.ip` is otherwise only meaningful for a
  direct connection ([[Known Blockers|BLK-003]] / [[ADR-009 API Security Posture]]);
- HSTS is a deployment/HTTPS-termination concern, not set in application code.

See [[API Key Boundaries]].
