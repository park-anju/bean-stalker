---
id: AUTH-PRIVACY-BOUNDARIES
type: authority-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-28
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

## Application logging (H02)

Bean Stalker's Fastify logging is configured to conform to this policy:

- precise search coordinates and the cafe-search request body are never logged
  (the request serializer emits only method + path; bodies are not serialized;
  a `redact` list removes coordinate-shaped fields from any manual log call);
- the client IP is **not** logged or persisted — it is used only as an
  ephemeral in-memory key for the per-client rate limiter, then discarded when
  its window expires;
- provider/API credentials and raw provider response payloads are never logged;
  a thrown error's attached properties are stripped before serialization;
- retained for observability: request id, method, path, status, latency, and
  bounded application error codes.

This does not change the fact that the **live** Google Places provider
necessarily receives the search centre to perform Nearby Search — see below.

## Browser storage

Only preferences/favourites necessary for MVP are persisted locally. See [[Data Handling Policy]].

## Third-party processing

Google Maps Platform receives requests required to deliver maps/place data. UI/legal text should not falsely imply that Bean Stalker itself owns or independently verifies provider data.
