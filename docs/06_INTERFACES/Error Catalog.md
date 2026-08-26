---
id: IFACE-ERROR-CATALOG
type: catalog
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Error Catalog

| Code | HTTP | Meaning | User treatment |
|---|---:|---|---|
| `VALIDATION_ERROR` | 400 | Search request invalid/out of bounds | Correct input |
| `LOCATION_PERMISSION_DENIED` | client | Browser denied current location | Offer manual location |
| `LOCATION_UNAVAILABLE` | client | Browser could not determine location | Retry/manual location |
| `PROVIDER_AUTH_ERROR` | 502 | Provider credential/configuration rejected | Generic unavailable message; inspect ops |
| `PROVIDER_RATE_LIMITED` | 503 | Provider quota/rate constraint | Retry later; avoid loops |
| `PROVIDER_UNAVAILABLE` | 503 | Provider/network dependency failure | Retry |
| `PROVIDER_BAD_RESPONSE` | 502 | Unexpected provider response | Generic unavailable message |
| `REQUEST_ABORTED` | client | Search superseded/cancelled | No alarming error toast |
| `INTERNAL_ERROR` | 500 | Unexpected server failure | Generic error + request id |
| `FAVORITES_STORAGE_ERROR` | client | localStorage inaccessible/corrupt | Continue without crash; allow reset |

## Rules

- Do not expose provider keys, stack traces or raw provider payloads.
- Empty cafe arrays are successful `200` responses, not errors.
- Client location errors are not server HTTP errors.
