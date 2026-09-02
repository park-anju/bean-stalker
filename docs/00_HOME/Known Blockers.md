---
id: HOME-KNOWN-BLOCKERS
type: execution-state
status: approved
version: 1.1
authority: execution
owner: Project Owner
updated: 2026-09-03
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

- ~~Fastify rate limiting on `POST /api/v1/cafes/search`~~ — **done (H03)**;
- ~~a global metered-provider usage guard~~ — **abstraction + in-memory impl done
  (H04)**, but a durable/shared production implementation is still required
  ([[Known Blockers|BLK-004]]);
- ~~graceful capacity-exhaustion behaviour~~ — **done (H05)**;
- ~~privacy-safe application logging~~ — **done (H02)**;
- ~~fail-closed live env config; frontend build secret gate; strict CORS;
  security headers; bounded body/request limits~~ — **done (H06/H07,
  [[ADR-009 API Security Posture]])**;
- Google Cloud daily quota caps on both credentials;
- a budget/usage alert on the Cloud project;
- production API-key restrictions (browser key: referrer + Maps JS + Map ID;
  server key: Places API + server/IP where practical);
- a real Cloud-configured `VITE_GOOGLE_MAPS_MAP_ID` (not `DEMO_MAP_ID`);
- deployment-specific **`trustProxy` / client-identity** configuration for the
  per-client rate limiter once the reverse-proxy topology is known (H07 left
  `trustProxy` at its safe default — `request.ip` is the socket address only);
- **HSTS** and HTTPS termination for the chosen host (not set in app code).

T07 delivered the **frontend** half of RM0 (request discipline); H02–H07
delivered the in-process server half (cost controls + logging privacy + secrets
& API-surface hardening). This blocker now covers only the **Google-side and
deployment-topology** configuration.

**Affects:** T08, T14.

**Mitigation:** local dev/CI run in `CAFE_PROVIDER=fixture` with no billable
traffic; the Maps JS script is blocked in automated tests.

## BLK-004 — Global usage guard is not a production financial hard cap

**Status:** open until a durable/shared implementation exists or an equivalent infrastructure guard is in place.

The H04 `ProviderUsageGuard` currently has only an **in-memory** implementation
(`InMemoryProviderUsageGuard`). It resets on process restart and is not shared
across instances, so it is test/development infrastructure — not a production
budget enforcement mechanism ([[ADR-008 Metered Provider Cost Controls]]).

**Public release cannot happen until** the usage guard uses a durable/shared
implementation appropriate to the chosen deployment topology, **OR** an
equivalent infrastructure-level hard guard (Google Cloud service quota + budget
cap that actually stops requests) is demonstrably provided.

**Affects:** T14 (deploy), public release. Not a blocker for T08 (small
controlled live smoke) or local development.

**Mitigation:** the interface (`tryConsume`/`getStatus`, atomic
check-and-consume) is designed so a durable backend can be substituted without
touching the route.

## BLK-002 — Deployment target not yet selected

P0 can be built locally before a host is chosen. Deployment details remain an execution decision as long as the deployment preserves the server-side secret boundary.

**Affects:** T14 only.

## Not blockers

- geolocation denial is a supported user path via [[Location Resolution]];
- absence of a database is intentional under [[ADR-004 Favorites Local Storage]].
