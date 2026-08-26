---
id: IFACE-API-CONTRACT
type: interface-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# API Contract

Canonical machine-readable contract: `openapi.yaml`.

## POST `/api/v1/cafes/search`

Purpose: perform a bounded nearby cafe search from a validated center.

Request fields:
- `center.latitude`
- `center.longitude`
- `radiusMeters`
- `maxResults`
- `rankPreference`

The server does not accept a provider API key from the client.

Response:
- normalized `searchCenter`;
- `fetchedAt` ISO timestamp;
- normalized `cafes[]`.

## GET `/api/v1/health`

Returns process-level health only. It does not need to make a billable Google Places request.

## Validation/bounds

P0 planning bounds:
- radius: 100–5000 meters;
- max results: 1–20;
- valid lat/lng;
- known rank enum only.

Exact provider-compatible constraints should be rechecked during T05 without weakening these app-side safety bounds.

## Error envelope

```json
{
  "error": {
    "code": "PROVIDER_UNAVAILABLE",
    "message": "Cafe search is temporarily unavailable.",
    "requestId": "..."
  }
}
```

See [[Error Catalog]] and [[External Service Constraints]].
