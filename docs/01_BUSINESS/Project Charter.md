---
id: BUS-PROJECT-CHARTER
type: business-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Project Charter

## Project

**Bean Stalker — Cafe Discovery App**

## Purpose

Create a compact but credible software-engineering portfolio project demonstrating React/TypeScript application design, external API integration, geolocation, secure credential boundaries, mapping UX, tests and deployment discipline.

## Delivery window

Three focused implementation days for P0, followed by optional productionization.

## Operating principles

1. Ship a narrow complete flow before adding features.
2. Live-data integrity beats decorative UI.
3. External provider cost/security constraints are architecture concerns, not afterthoughts.
4. Unknown data remains unknown.
5. No implementation claim without evidence.
6. Every significant technical deviation becomes an ADR.

## Technical baseline

See [[System Architecture]] and [[Decision Index]].

## Acceptance authority

P0 acceptance is determined by [[Acceptance Matrix]] and [[Release Readiness]], with implementation evidence recorded in [[Implementation Handoffs]].

## Constraints

- Google Maps Platform requires provider configuration and may incur usage cost;
- three-day build window discourages account/database complexity;
- user location is privacy-sensitive and should not be unnecessarily persisted;
- provider schemas/quotas can change and are treated as an external boundary.
