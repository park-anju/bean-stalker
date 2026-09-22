---
id: IFACE-ERROR-CATALOG
type: catalog
status: approved
version: 1.1
authority: canonical
owner: Project Owner
updated: 2026-09-03
---
# Error Catalog

| Code | HTTP | Meaning | User treatment |
|---|---:|---|---|
| `VALIDATION_ERROR` | 400 / 413 | Request rejected before processing — invalid, out of bounds, unparseable, or over the 16 KiB body limit (H07) | Correct input |
| `NOT_FOUND` | 404 | Unknown route, or an unsupported method on a known path (H07). No route pattern is leaked. | None (client bug) |
| `LOCATION_PERMISSION_DENIED` | client | Browser/site denied current location | Browser-settings guidance + explicit retry; do not claim the app can reopen or override permission |
| `LOCATION_UNAVAILABLE` | client | Position unavailable, timeout, unexpected acquisition error, unsupported Geolocation, or insecure context | Device/browser guidance + explicit retry when meaningful; bounded unsupported or HTTPS-required message otherwise |
| `RATE_LIMITED` | 429 | This client sent search requests too quickly (per-client limit, H03) | "You're searching too quickly" + explicit retry; `Retry-After` header; no auto-retry loop |
| `PROVIDER_CAPACITY_EXHAUSTED` | 503 | Bean Stalker's configured global metered-provider allowance for the period is used up (H04) | "Live cafe search is temporarily unavailable" + retry later; no counter/pricing detail |
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
- Never surface raw browser geolocation error messages. Browser permission denial,
  device/OS location restrictions and an insecure origin cannot always be
  distinguished beyond the standardized result; copy must not overclaim.
- Do not expose the client IP, rate-limit internals, usage counters, Google
  pricing or the monthly cap value in an error response or in application logs.
- `RATE_LIMITED` (client-specific) and `PROVIDER_CAPACITY_EXHAUSTED` (global)
  are deliberately distinct codes and HTTP statuses — do not collapse them.
- Rejected requests (`VALIDATION_ERROR`, `RATE_LIMITED`,
  `PROVIDER_CAPACITY_EXHAUSTED`) never reach the metered provider.
