---
id: OPS-LOCAL-DEVELOPMENT
type: runbook
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-28
---
# Local Development Runbook

## Before implementation

```bash
node scripts/validate-brain.mjs
```

## After T00 expected workflow

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
pnpm dev
```

Exact bootstrap scripts are established by T00 and then this runbook must be updated to match reality.

## Development modes

### Fixture mode
Recommended for routine development/tests. No live provider call and no billable
traffic. Set `CAFE_PROVIDER=fixture` in `apps/api/.env` (this is the value in
`apps/api/.env.example`). `FixtureCafeProvider` serves
`tests/fixtures/nearby-cafes-happy.json` through the same normalization path as
the live provider. The browser Maps key/Map ID may be placeholders in this mode;
the map surface then shows its handled "unavailable" state while the cafe list
works normally.

### Live mode
Set `CAFE_PROVIDER=live` with a real restricted `GOOGLE_PLACES_SERVER_KEY`, and a
real `VITE_GOOGLE_MAPS_BROWSER_KEY` + `VITE_GOOGLE_MAPS_MAP_ID` for the map.
Requires explicit developer intent. Use for integration smoke tests (T08), not
every unit/e2e run.

## Common checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```

## Troubleshooting

- map blank → inspect browser key/API/referrer restrictions and console;
- search 502/503 → inspect safe API log/request ID and server credential/configuration;
- geolocation denied → use manual location path by design;
- repeated API traffic → inspect TanStack Query key/refetch configuration before increasing quotas.
