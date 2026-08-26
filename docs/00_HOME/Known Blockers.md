---
id: HOME-KNOWN-BLOCKERS
type: execution-state
status: approved
version: 1.0
authority: execution
owner: Project Owner
updated: 2026-08-27
---
# Known Blockers

## BLK-001 — Google Maps Platform credentials

**Status:** open until configured by the developer.

Live cafe search requires a Google Cloud project, required APIs, billing configuration, and restricted credentials. The brain cannot create or verify those credentials.

**Affects:** live integration tasks T05–T07.

**Mitigation:** use contract fixtures/mocked provider responses for local development until credentials exist. Do not call mock data “live”.

## BLK-002 — Deployment target not yet selected

P0 can be built locally before a host is chosen. Deployment details remain an execution decision as long as the deployment preserves the server-side secret boundary.

**Affects:** T14 only.

## Not blockers

- geolocation denial is a supported user path via [[Location Resolution]];
- absence of a database is intentional under [[ADR-004 Favorites Local Storage]].
