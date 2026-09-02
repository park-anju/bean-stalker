---
id: GOV-DATA-HANDLING
type: governance
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-28
---
# Data Handling Policy

## Data classes

| Data | Source | Persistence | Rule |
|---|---|---|---|
| Current user coordinates | browser geolocation | transient only | do not store as history |
| Manual search center | user/provider | current state/cache | avoid durable history in P0 |
| Cafe/place data | Google | query cache + favourite snapshots | treat as provider data; may become stale |
| Favourites | user action | localStorage | local browser only |
| Provider credentials | developer/provider | env/secret storage | never docs/Git/browser for server key |
| Logs | app/API | runtime platform | no secrets; no request bodies; no precise coordinates; no client IP; bounded error codes only (H02 / [[Privacy Boundaries]]) |
| Client IP | connection | in-memory only, per rate-limit window | ephemeral rate-limit key; never logged, never persisted, never combined with coordinates (H03) |
| Provider usage counters | app/API | in-memory, per UTC month | operational cost-guard state only; never returned to clients or logged with detail (H04 / [[ADR-008 Metered Provider Cost Controls]]) |

## Retention

P0 has no server database. Browser cache/localStorage can be cleared by the user. Operational logs follow host defaults until a deployment-specific retention policy is established.

## Deletion/reset

A UI reset action should be able to clear Bean Stalker favourites/preferences without affecting unrelated browser storage.
