---
id: DEC-ADR-003
type: decision
status: approved
version: 2.0
authority: canonical
owner: Project Owner
updated: 2026-09-19
---
# ADR-003 Location Permission

**Status:** Accepted

## Decision summary

Discover automatically requests current location; raw coordinate entry is not a user fallback.

## Context
Browser geolocation can be denied, unavailable, unsupported or inaccurate. The
former raw latitude/longitude form was technically useful but inappropriate for
normal cafe users. No existing human-friendly place/address mechanism is available.

## Decision
On entry to Discover, request current location once when no usable session location
exists. A successful acquisition commits the existing `SearchCenter`, which enables
the existing cafe query automatically. Permission/error states offer bounded
guidance and explicit retry where meaningful. Precise coordinates are neither
displayed nor persisted.

`navigator.geolocation.getCurrentPosition` is the authoritative permission and
acquisition operation. Bean Stalker does not use a Permissions API result as a gate:
on an undecided site permission this call is what allows the browser to show its
native UI, and browsers without a compatible Permissions API must still work. A
saved denial may reject immediately; the app then waits for an explicit retry after
the user changes browser/site settings. Production geolocation requires HTTPS,
while localhost remains a supported development context.

The browser-specific behavior stays behind `GeolocationAdapter`; location state,
search orchestration, provider access and UI remain separate. A future native
adapter can implement the same acquisition interface.

A human-friendly manual place/address fallback is deferred. This decision does not
authorize a geocoder, autocomplete product or paid provider.

## Consequences
- Discover depends on current-location permission until a human-friendly manual fallback is separately implemented;
- denied users receive settings guidance and a user-triggered retry, never a prompt loop;
- Bean Stalker cannot control native prompt UI, override site/browser denial, or
  enable device/OS location services;
- one resolved center enters the existing cost-safe TanStack Query pipeline without an extra Search action;
- location state has explicit denied/unavailable/timeout/insecure-context/unsupported/unexpected states.

Constrains [[Location Resolution]], [[Search Lifecycle]] and [[UX Contract]].
