---
id: EXEC-PRE-T08-CHECKPOINT
type: execution-state
status: approved
version: 1.0
authority: execution
owner: Project Owner
updated: 2026-09-03
---
# Bean Stalker — Pre-T08 Project Checkpoint

**Checkpoint status:** PAUSED — external billing/payment blocker
**Current development phase:** P0 MVP feature implementation complete; the full pre-T08 hardening + docs chain H02–H10 complete; no task is READY — everything remaining is T08-gated
**Next milestone:** T08 — Restricted-Credential Live Google Provider Smoke

---

## 1. Current Product State

Bean Stalker currently has a complete fixture-backed P0 application flow.

Completed:

```text
T00 — Workspace / tooling / monorepo
T01 — Shared contracts + Zod validation
T02 — Domain logic
T03 — React application shell
T04 — Location resolution
T05 — Fastify cafe-search API + Google Places provider
T06 — Google Maps JavaScript integration
T07 — Search orchestration + cafe list + map markers
T09 — Local filtering + sorting
T10 — localStorage favourites
```

Current functional flow:

```text
Location
   ↓
Cafe search
   ↓
Cafe[]
   ├── Accessible result list
   └── Map + markers
          ↕
      Selection

Cafe[]
   ↓
Local filters / sorting
   ↓
Displayed cafes

Cafe
   ↓
Favourite
   ↓
Versioned localStorage
   ↓
/favorites
```

The system is fully functional using deterministic fixture data.

Automated validation as of T10:

```text
236 unit/component tests passing
23 Playwright E2E tests passing

Brain validation passing
Lint passing
Formatting passing
Typecheck passing
Build passing
Development cold-start passing
Fastify /health passing
```

---

## 2. Feature Development Status

The ordinary P0 MVP feature-development phase is complete.

Feature freeze is now in effect.

Do not add unrelated features before the resume-ready release.

Specifically defer:

```text
accounts
database-backed user profiles
reviews
AI recommendations
social features
search history
admin features
cloud-synced favourites
```

Future functionality should not delay T08, hardening, deployment, or portfolio release.

---

## 3. Current External Blocker

T08 requires real Google Maps Platform credentials.

Google Cloud Billing setup was attempted using a Bank Islam debit card.

Google returned:

```text
Transaction declined: invalid payment method
```

The card credentials were believed to be correct.

Likely causes under investigation include:

```text
Bank Islam overseas-transaction restrictions
Card-Not-Present restrictions
recurring/international merchant authorization
issuer-side security rejection
```

No Cloud Billing account was successfully activated during this attempt.

No paid Google API usage was intentionally enabled.

### Blocker resolution

Before retrying Google Cloud Billing:

1. Verify Bank Islam overseas transactions.
2. Verify Card-Not-Present / e-commerce capability.
3. Verify recurring international merchant transactions are supported.
4. Contact Bank Islam if required.
5. Retry Google Cloud Billing only after the payment-method issue is understood.

T08 remains BLOCKED until the billing/credential prerequisite is satisfied.

---

## 4. Google Billing Strategy

Bean Stalker is intended to remain online beyond any temporary Google Cloud Free Trial period.

Therefore, the intended long-term architecture is a normal Google Cloud PAYG billing account, subject to strict cost controls.

Financial policy:

```text
Expected Google API expenditure:
RM0/month

Preferred maximum:
≤ RM5/month

Maximum tolerated exposure:
RM10/month
```

RM5–RM10 is a safety tolerance, not expected operating expenditure.

The system should normally remain within Google Maps Platform's monthly no-charge usage thresholds.

### Failure policy

If Bean Stalker must choose between:

```text
continuing live search
```

and:

```text
preventing uncontrolled paid usage
```

prefer service degradation/interruption.

Unexpected spending is a release failure.

---

## 5. Existing Cost-Safety Architecture

T07 established cost-safe cafe-search orchestration.

The following do not create additional cafe-search requests:

```text
React rerender
window focus
network reconnect
component remount within fresh cache
map pan
map zoom
marker selection
cafe-card selection
automatic retry
polling
```

T09 additionally established:

```text
minimum-rating filter → 0 searches
Open Now filter       → 0 searches
local sort            → 0 searches
Reset filters         → 0 searches
```

T10 established:

```text
add favourite       → 0 searches
remove favourite    → 0 searches
open /favorites     → 0 searches
reload /favorites   → 0 searches
```

Only a deliberate committed cafe search is intended to consume the Google Places provider.

Before public release, additional controls were required. Status after
hardening milestones H02–H10 ([[ADR-008 Metered Provider Cost Controls]],
[[ADR-009 API Security Posture]], [[System Architecture]] v2.0):

```text
privacy-safe application logging        DONE (H02)
Fastify abuse/rate limiting            DONE (H03 — per-client 429 RATE_LIMITED)
global provider-usage protection       DONE abstraction + in-memory impl (H04);
                                       durable/shared prod impl still required (BLK-004)
graceful capacity-exhaustion behaviour DONE (H05 — 503 PROVIDER_CAPACITY_EXHAUSTED)
secrets & configuration hardening      DONE (H06 — fail-closed live config,
                                       origin validation, build secret gate)
backend security hardening             DONE (H07 — strict CORS, security headers,
                                       body/request limits, canonical NOT_FOUND)
Google service quota configuration     PENDING — Google Cloud (T08/deploy)
budget/usage alerts                    PENDING — Google Cloud (T08/deploy)
restricted API credentials             PENDING — Google Cloud (T08)
durable/shared usage guard             PENDING — deployment (BLK-004)
trustProxy / HSTS                      PENDING — deployment (BLK-003)
usage monitoring                       PENDING — deployment
mobile & accessibility QA              DONE (H08 — WCAG AA contrast, 24 px
                                       target size, assertive error alerts,
                                       320 px + keyboard e2e, axe scan)
architecture docs                      DONE (H09 — System Architecture v2.0
                                       as-built: 7 verified views + non-goals
                                       + future/blocked; 0 code changes)
portfolio README                       DONE (H10 — public-facing README;
                                       2 .env.example copy-and-run fixes;
                                       0 runtime code changes)
portfolio screenshots / demo GIF       PENDING — later packaging step
repository LICENSE                      PENDING — none declared
Maps Platform attribution / ToS check  PENDING — pre-deployment
```

---

## 6. Privacy Principles

Bean Stalker adopts privacy-by-design and data-minimization principles.

### Precise location

Precise search coordinates are required only to perform location-aware cafe discovery.

Allowed:

```text
volatile browser state
HTTPS request to Bean Stalker Fastify API
Google Places Nearby Search request
```

Not intentionally persisted to:

```text
localStorage
database
search history
analytics
favourite records
application logs
```

Precise location should exist only for as long as required by the active discovery interaction.

### Logging

Do not intentionally log precise user coordinates or complete request bodies containing them.

Preferred operational logging:

```text
request ID
route
HTTP status
duration
provider/application error code
bounded aggregate metrics
```

Avoid:

```text
precise latitude/longitude
raw provider responses
API keys
persistent location histories
```

### Third-party processing

Google Maps Platform necessarily receives the search location required to execute Nearby Search.

Bean Stalker must not falsely claim that search coordinates never reach third parties.

The system should transmit only the information required to perform cafe discovery.

### Optional location permission

Device geolocation is optional.

Users must be free to deny GPS permission.

Manual/alternative location entry must remain available.

---

## 7. Favourite Privacy Boundary

Favourites are persistent local client state.

Stored:

```text
FavoriteStore
version
placeId
savedAt
Cafe snapshot
```

Not stored:

```text
user SearchCenter
search history
request IDs
API credentials
raw Google provider responses
user identity/account information
```

Favourites stay in the browser's localStorage.

There is currently:

```text
no account
no database
no cloud sync
```

Fastify therefore remains stateless with respect to users and favourites.

---

## 8. T08 Purpose

T08 must not become general production deployment.

Its purpose is narrowly:

> Prove that Bean Stalker's existing architecture operates correctly against the real Google Maps Platform using intentionally configured, restricted and financially controlled credentials.

T08 should verify:

```text
real Nearby Search response
real cafe data
real Maps JavaScript rendering
real project Map ID
real Advanced Markers
list ↔ marker synchronization
real missing/optional provider fields
real error handling
actual request counts
basic observed latency
credential isolation
privacy-safe logging
```

Live testing should use a very small predetermined number of deliberate requests.

No load testing.

---

## 9. Pre-T08 Google Cloud Requirements

Before the first controlled live search:

```text
dedicated Bean Stalker Google Cloud project
Cloud Billing deliberately enabled
only required APIs enabled
browser Maps key created
browser key HTTP-referrer restricted
browser key Maps-JS API restricted
server Places key created
server key Places-API-only restricted
server application restriction applied where practical
real project Map ID created
budget/usage alerts configured
service quotas reviewed/configured
credentials stored only in gitignored environment files
server Places key absent from frontend build
```

Required APIs currently:

```text
Maps JavaScript API
Places API (New)
```

Do not enable unrelated Google Maps Platform APIs without a requirement.

---

## 10. T08 Real-Data Observations

When T08 becomes possible, test a deliberately small set of different location types:

```text
dense commercial location
residential/suburban location
relatively sparse location
```

Observe rather than prematurely change:

```text
radiusMeters = 2000
maxResults = 10
rankPreference = DISTANCE
staleTime = 5 minutes
```

These remain partly governed by OQ-011.

Look specifically for real-world cases involving:

```text
missing rating
missing review count
missing opening information
missing price level
long cafe names
long addresses
unexpected business status
international/non-ASCII text
```

Fixture success does not replace real-provider verification.

---

## 11. Open Questions

Still open:

```text
OQ-010
Final manual-location UX / autocomplete/geocoding

OQ-011
Search radius, maxResults and cache-lifetime assumptions

OQ-012
Whether Discovery eventually needs a favourites-only filter

OQ-013
Whether PROVIDER_CAPACITY_EXHAUSTED should show an immediate Retry button
```

Do not resolve these merely because the project is paused.

---

## 12. Post-MVP Feature Backlog

### Multi-Origin Group Cafe Search

Future Bean Stalker should support two or more participant origins.

Use case:

> A group wants to find cafes that are reasonably convenient for everybody rather than optimizing only for one participant.

Each participant may have:

```text
origin location
individual willing radius
```

Example:

```text
Person A
willing radius = 12 km

Person B
willing radius = 5 km

Person C
willing radius = 20 km
```

Recommendation tiers:

```text
Tier 1 — Fully feasible
Cafe lies inside every participant's willing radius.

Tier 2 — Fair compromise
No common feasible cafe exists.
Minimize the worst willingness violation.

Tier 3 — Alternatives
Show other reasonable candidates while clearly
communicating individual travel trade-offs.
```

Potential willingness violation:

```text
excess_i =
max(0, distance_i - willingRadius_i)
```

Possible fairness objectives include:

```text
minimize maximum excess
minimize total excess
minimize maximum travel burden
```

Do not simply optimize average distance if doing so severely disadvantages one participant.

### Privacy requirement for group search

Participant origins are particularly sensitive.

Default principles:

```text
approximate areas preferred
exact home address never required
device GPS optional
manual map point/landmark allowed
participant origins ephemeral
willing-radius settings ephemeral
no coordinate logging
no search-history persistence
no analytics containing participant origins
```

A later version may explore ephemeral shareable group sessions so participants can provide their own location/willingness rather than the initiator knowing exact home locations.

This feature is strictly POST-MVP.

Do not implement it before the resume-ready release.

---

## 13. Mobile Evolution

Bean Stalker's natural usage is mobile.

Current architecture remains:

```text
React/Vite responsive web client
        ↓
Fastify API
        ↓
Google Places
```

Recommended evolution:

```text
responsive web MVP
        ↓
real-phone validation
        ↓
PWA/installable web experience
        ↓
public portfolio release
        ↓
optional future native client
```

Do not pivot the current project to React Native before release.

Potential later architecture:

```text
Web/PWA ─────┐
             │
Mobile ──────┼──→ Fastify
             │
             └── shared packages/contracts
                 shared packages/domain
```

---

## 14. Deployment Is Not Yet Decided

Possible future topologies include:

```text
app.example.com
→ React/PWA

api.example.com
→ Fastify
```

or:

```text
example.com/
→ React/PWA

example.com/api/*
→ reverse proxy → Fastify
```

Hosting choice affects:

```text
CORS
API-key restrictions
server outbound IP
DNS
HTTPS
localStorage origin
cost
```

Do not lock deployment architecture before T08/live-integration constraints are understood.

A custom domain remains optional until release planning.

---

## 15. Resume-Ready Release Sequence

When the billing blocker is resolved:

```text
1. Review this checkpoint
2. Perform Pre-T08 governance verification
3. Configure Google Cloud safely
4. Run controlled T08 live provider smoke
5. Privacy/security hardening
6. Cost/abuse hardening
7. Actual-mobile-device testing
8. PWA/mobile-first polish if justified
9. Decide deployment architecture
10. Deploy
11. Configure production CORS/credentials
12. Final security/privacy/cost verification
13. GitHub/README/screenshots/architecture documentation
14. Resume-ready release
```

Feature development remains frozen during this sequence except for genuine release blockers.

---

## 16. Resume-Ready Technology Stack

Current stack:

```text
Language
TypeScript

Frontend
React
Vite
React Router
TanStack Query

Backend
Node.js
Fastify

Runtime validation
Zod

Mapping
Google Maps JavaScript API
AdvancedMarkerElement

Cafe provider
Google Places API (New)

Persistence
browser localStorage

Shared architecture
pnpm workspaces
packages/contracts
packages/domain

Testing
Vitest
React Testing Library
Playwright

Database
None in the current MVP
```

The lack of a database is intentional.

Bean Stalker has no server-owned user data requiring durable database persistence.

A stateless Fastify backend could still use a database in the future if product requirements justify one.

---

## 17. Resume Point of Return

When development resumes, do **not** begin by adding another feature.

Start with:

```text
T08 prerequisite:
resolve Google Cloud Billing/payment method

then:

Google Cloud safe setup
→ restricted credentials
→ controlled real-provider verification
```

The system should be considered:

> **P0 feature-complete, fixture-verified, live-provider-blocked.**

That is the current canonical stopping point.
