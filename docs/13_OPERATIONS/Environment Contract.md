---
id: OPS-ENVIRONMENT-CONTRACT
type: runbook
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-28
---
# Environment Contract

## Runtime baseline

- Node.js 20+ planning baseline;
- pnpm workspace;
- modern evergreen browser;
- Google Cloud project for live provider integration.

## Environment variables

### Web
```text
VITE_API_BASE_URL=http://localhost:3001
VITE_GOOGLE_MAPS_BROWSER_KEY=<restricted browser key>
VITE_GOOGLE_MAPS_MAP_ID=<Map ID for Advanced Markers>
```

`VITE_GOOGLE_MAPS_MAP_ID` is required (Advanced Markers do not render without
one). Use `DEMO_MAP_ID` for local development and tests; use a real
Cloud-configured, referrer-restricted Map ID for a deployed build. It is
browser-visible by design, like the browser key.

### API
```text
PORT=3001
WEB_ORIGIN=http://localhost:5173
GOOGLE_PLACES_SERVER_KEY=<server-only secret>
GOOGLE_PLACES_TIMEOUT_MS=<bounded timeout>
CAFE_PROVIDER=<live | fixture>
LOG_LEVEL=<fatal|error|warn|info|debug|trace|silent>   # default info
SEARCH_RATE_LIMIT_MAX=<int ≥ 1>                          # default 10
SEARCH_RATE_LIMIT_WINDOW_MS=<int ≥ 1000>                 # default 60000
PROVIDER_MONTHLY_REQUEST_LIMIT=<int ≥ 0>                 # required when CAFE_PROVIDER=live
```

`CAFE_PROVIDER` defaults to `live`. `fixture` (dev/test only) serves committed
fixtures with no billable Google traffic and is never valid in production.

`LOG_LEVEL` / `SEARCH_RATE_LIMIT_*` are validated operational config (H03).
`PROVIDER_MONTHLY_REQUEST_LIMIT` (H04, [[ADR-008 Metered Provider Cost Controls]])
is the global metered-provider attempt cap for a UTC month: **required** in
`live` mode (live cannot inherit an unbounded default), ignored in `fixture`
mode, and `0` is a deliberate fully-fail-closed value. The in-memory guard that
enforces it is **not** a production financial hard cap — [[Known Blockers|BLK-004]].
Deployment must additionally set `trustProxy` for the real reverse-proxy
topology before `request.ip` is trusted as the rate-limit client identity.

## Rules

- validate env at startup;
- secrets never have fake production defaults;
- `.env.example` contains names/placeholders only;
- server key never uses `VITE_` prefix;
- production origins are explicit.

See [[API Key Boundaries]].
