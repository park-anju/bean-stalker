---
id: DEC-ADR-003
type: decision
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# ADR-003 Location Permission

**Status:** Accepted

## Decision

Geolocation is optional, manual location is mandatory fallback.

## Context
Browser geolocation can be denied, unavailable or inaccurate.

## Decision
Treat current-location access as an optional convenience. Manual location selection remains a first-class path.

## Consequences
- no permission wall;
- more resilient demo;
- location state has explicit error/fallback states.

Constrains [[Location Resolution]], [[Search Lifecycle]] and [[UX Contract]].
