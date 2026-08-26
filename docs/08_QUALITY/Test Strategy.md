---
id: QA-TEST-STRATEGY
type: quality-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Test Strategy

## Goal

Prove the three-day MVP's critical behaviour without coupling routine test runs to billable/live provider traffic.

## Pyramid

### Unit
- Haversine distance;
- rating/distance sort;
- open/min-rating filters;
- favourite store parser/mutations;
- provider response normalization;
- error mapping.

### Component
- location permission outcomes;
- loading/empty/error panels;
- cafe card missing-field handling;
- filter/reset behaviour;
- favourite toggle persistence adapter.

### API integration
- valid search → provider adapter → normalized response;
- invalid lat/lng/radius/result count;
- provider 4xx/5xx/quota/auth/invalid payload mapping;
- server key never accepted/returned in contract.

### End-to-end
Use Playwright with mocked API/provider boundary for deterministic happy path and major failure path. Live provider smoke testing is manual/optional because it requires credentials and can incur cost.

## Required gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```

See [[Test Case Catalog]], [[Acceptance Matrix]] and [[Definition of Done]].
