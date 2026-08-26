---
id: AUTH-PRIVACY-BOUNDARIES
type: authority-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Privacy Boundaries

## Sensitive input

Precise current-location coordinates can reveal where a person is. P0 treats them as transient functional input.

## P0 policy

- request geolocation only after a clear user action or understandable flow;
- manual location search remains available;
- do not store current-location history in localStorage;
- do not create a server database of searches;
- avoid logging raw precise coordinates;
- favour coarse/hashed/redacted diagnostics if location context is needed for debugging;
- favourites may contain cafe coordinates because they describe public place locations, not the user's location.

## Browser storage

Only preferences/favourites necessary for MVP are persisted locally. See [[Data Handling Policy]].

## Third-party processing

Google Maps Platform receives requests required to deliver maps/place data. UI/legal text should not falsely imply that Bean Stalker itself owns or independently verifies provider data.
