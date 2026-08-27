---
id: HOME-KNOWN-BLOCKERS
type: execution-state
status: approved
version: 1.0
authority: execution
owner: Project Owner
updated: 2026-08-28
---
# Known Blockers

## BLK-001 — Google Maps Platform credentials

**Status:** open until configured by the developer.

Live cafe search requires a Google Cloud project, required APIs, billing configuration, and restricted credentials. The brain cannot create or verify those credentials.

**Affects:** live provider verification (T08). T05–T07 are built and verified against fixtures/mocks and do not need credentials.

**Mitigation:** `CAFE_PROVIDER=fixture` (T07) serves committed fixtures through the real normalization path; automated tests mock the API-client and Maps-script boundaries. Do not call mock data “live”.

## BLK-003 — Public deployment blocked until cost/abuse controls are configured

**Status:** open until configured by the developer.

Per RM0 ([[Non-Functional Requirements|NFR-009]]), public deployment cannot
happen until all of the following exist:

- Fastify rate limiting on `POST /api/v1/cafes/search`;
- Google Cloud daily quota caps on both credentials;
- a budget/usage alert on the Cloud project;
- production API-key restrictions (browser key: referrer + Maps JS + Map ID;
  server key: Places API + server/IP where practical);
- a real Cloud-configured `VITE_GOOGLE_MAPS_MAP_ID` (not `DEMO_MAP_ID`).

T07 delivered the **frontend** half of RM0 (request discipline). This blocker
covers the server/infra half. It is not a T07 defect.

**Affects:** T08, T14.

**Mitigation:** local dev/CI run in `CAFE_PROVIDER=fixture` with no billable
traffic; the Maps JS script is blocked in automated tests.

## BLK-002 — Deployment target not yet selected

P0 can be built locally before a host is chosen. Deployment details remain an execution decision as long as the deployment preserves the server-side secret boundary.

**Affects:** T14 only.

## Not blockers

- geolocation denial is a supported user path via [[Location Resolution]];
- absence of a database is intentional under [[ADR-004 Favorites Local Storage]].
