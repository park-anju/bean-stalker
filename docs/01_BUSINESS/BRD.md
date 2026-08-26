---
id: BUS-BRD
type: business-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# BRD

# Business Requirements Document — Bean Stalker

## 1. Problem

Finding a cafe nearby is easy in a generic map product, but a focused discovery interface can demonstrate how location, provider APIs, filtering, client/server state and map visualization work together in a compact engineering project.

## 2. Product objective

Deliver a polished cafe-discovery web app that turns a user-selected location into useful, trustworthy cafe results with minimal friction.

## 3. Target user

A person who wants to quickly answer: **“Which cafes near this location are worth checking?”**

No account, organization or administrator persona exists in P0.

## 4. Value proposition

- immediate nearby cafe discovery;
- visual map + scannable list;
- useful sorting/filtering without generic map clutter;
- local favourites for return visits;
- transparent failure states when live data is unavailable.

## 5. Business requirements

### BRQ-01 — location-aware discovery
The product shall search from either user geolocation or a manually selected location.

### BRQ-02 — live provider data
Cafe results shall originate from Google Maps Platform during live operation. Test fixtures must be clearly isolated from production/live mode.

### BRQ-03 — useful result information
Results shall expose enough information to compare cafes: name, address/location, rating when available, rating count when available, opening status when available, price level when available, and map position.

### BRQ-04 — result refinement
Users shall be able to sort/filter the returned set without triggering accidental misleading claims.

### BRQ-05 — favourites
Users shall be able to save/remove cafe favourites on the current browser/device without creating an account.

### BRQ-06 — resilient UX
Permission denial, provider errors, quota/rate failures, missing fields and empty results shall have explicit states.

### BRQ-07 — cost/security discipline
The app shall use restricted credentials, minimal Places field masks, explicit request limits and no committed secrets.

### BRQ-08 — resume-quality evidence
The repository shall contain a README, architecture explanation, setup instructions, tests and a reproducible demo path.

## 6. Success criteria

P0 is successful when the [[Golden Demo Scenario]] can be completed from a clean browser and [[Release Readiness]] has no unresolved P0 blocker.

## 7. Non-goals

- becoming a replacement for Google Maps;
- user-generated reviews;
- booking/order/payment flows;
- loyalty features;
- account/cloud sync;
- machine-learning recommendations;
- merchant management.

See [[MVP Scope]], [[SRS]] and [[Traceability Matrix]].
