---
id: OPS-LOCAL-DEVELOPMENT
type: runbook
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
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
Recommended for routine development/tests. No live provider call and no billable traffic.

### Live mode
Requires restricted credentials and explicit developer intent. Use for integration smoke tests, not every unit/e2e run.

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
