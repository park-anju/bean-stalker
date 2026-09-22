---
id: DOMAIN-SEARCH-LIFECYCLE
type: domain-spec
status: approved
version: 2.0
authority: canonical
owner: Project Owner
updated: 2026-09-19
---
# Search Lifecycle

## Canonical states

```mermaid
stateDiagram-v2
  [*] --> IDLE
  IDLE --> LOCATING: enter Discover without a usable location
  LOCATING --> READY: location resolved
  LOCATING --> LOCATION_ERROR: denied/unavailable/timeout
  LOCATION_ERROR --> LOCATING: user selects Try location again
  READY --> SEARCHING: resolved center enables query
  SEARCHING --> RESULTS: cafes returned
  SEARCHING --> EMPTY: no cafes returned
  SEARCHING --> SEARCH_ERROR: provider/network/validation failure
  RESULTS --> SEARCHING: change center/radius and refresh
  EMPTY --> SEARCHING
  SEARCH_ERROR --> SEARCHING: retry
```

## Rules

- Recoverable `LOCATION_ERROR` states expose an explicit, user-triggered location retry; no automatic retry loop is allowed.
- Resolving a center automatically enables the existing TanStack Query search; there is no extra initial Search click.
- A new search request supersedes earlier in-flight presentation; stale responses must not overwrite a newer search.
- `EMPTY` means a successful search returned no matching cafes; it is not an API error.
- `SEARCH_ERROR` must retain enough context to retry safely.
- Cached results may be shown according to [[Search Result Freshness]], but the UI must not misrepresent stale cache as a new successful provider request.

See [[Error Catalog]] and [[UX Contract]].
