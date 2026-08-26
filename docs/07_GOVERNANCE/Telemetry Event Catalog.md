---
id: GOV-TELEMETRY-CATALOG
type: catalog
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Telemetry Event Catalog

Telemetry is optional in P0 and must not block core delivery. If implemented, use stable, privacy-conscious event names.

| Event | Meaning | Avoid |
|---|---|---|
| `search_started` | user initiated cafe search | raw precise coordinates |
| `search_succeeded` | API returned successfully | place payload dump |
| `search_empty` | successful zero-result search | raw coordinates |
| `search_failed` | search failed by safe category | provider secret/raw response |
| `location_permission_result` | granted/denied/unavailable | coordinate values |
| `favorite_added` | local favourite action | unnecessary cafe details |
| `favorite_removed` | local favourite removal | unnecessary cafe details |
| `google_maps_opened` | external destination action | full browsing history |

## Rule

Product analytics never becomes an excuse to persist precise user location in P0. See [[Privacy Boundaries]].
