---
id: OPS-ENVIRONMENT-CONTRACT
type: runbook
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
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
```

### API
```text
PORT=3001
WEB_ORIGIN=http://localhost:5173
GOOGLE_PLACES_SERVER_KEY=<server-only secret>
GOOGLE_PLACES_TIMEOUT_MS=<bounded timeout>
```

## Rules

- validate env at startup;
- secrets never have fake production defaults;
- `.env.example` contains names/placeholders only;
- server key never uses `VITE_` prefix;
- production origins are explicit.

See [[API Key Boundaries]].
