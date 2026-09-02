---
id: OPS-API-COST-GUARDRAIL
type: runbook
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-28
---
# API Cost Guardrail Runbook

## Purpose

Google Maps Platform usage can incur cost. Bean Stalker deliberately limits accidental amplification.

## Guardrails

- explicit minimal Places field mask;
- bounded `maxResults`;
- bounded radius;
- no provider call on every map pan/keystroke unless intentionally designed later;
- TanStack Query keys stable enough to avoid duplicate requests from floating-point jitter;
- deterministic tests use fixtures/mocks;
- separate dev/prod credentials where practical;
- provider budget/usage alerts configured by the developer;
- **per-client rate limit** on `POST /api/v1/cafes/search` (H03) —
  `SEARCH_RATE_LIMIT_MAX` / `SEARCH_RATE_LIMIT_WINDOW_MS`, provisional `10/min`;
  429 `RATE_LIMITED` + `Retry-After`; the client IP is an ephemeral key only;
- **global fail-closed usage guard** (H04, [[ADR-008 Metered Provider Cost Controls]]) —
  `PROVIDER_MONTHLY_REQUEST_LIMIT` (required in live mode; provisional
  `600–750/month`); one unit consumed before each provider attempt, not
  refunded on failure; 503 `PROVIDER_CAPACITY_EXHAUSTED` when exhausted. The
  in-memory implementation is not a production hard cap — [[Known Blockers|BLK-004]];
- **graceful capacity exhaustion** (H05) — 429 vs 503 are distinct; no automatic
  retry; the UI stays usable with bounded copy.

## Layering

```
T07 client request discipline
  → schema validation
  → per-client rate limit (429 RATE_LIMITED)
  → global usage guard (503 PROVIDER_CAPACITY_EXHAUSTED)
  → metered provider
  → Google-side service quotas + budget cap (T08 / deployment)
```

Each layer is independent; the failure of any one still leaves the others.

## Incident: unexpected usage spike

1. Check provider usage dashboard and key-specific traffic.
2. Verify browser/server key restrictions.
3. Inspect deploy logs for repeated request patterns.
4. Disable public search/deploy if financial exposure is material.
5. Fix request loop/abuse path before restoring.
6. Rotate a key only when compromise is suspected or required; restriction should be the normal first line of defense.
