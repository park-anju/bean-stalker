---
id: GOV-DATA-HANDLING
type: governance
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
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
| Logs | app/API | runtime platform | no secrets; minimize precise location |

## Retention

P0 has no server database. Browser cache/localStorage can be cleared by the user. Operational logs follow host defaults until a deployment-specific retention policy is established.

## Deletion/reset

A UI reset action should be able to clear Bean Stalker favourites/preferences without affecting unrelated browser storage.
