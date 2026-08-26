---
id: OPS-API-COST-GUARDRAIL
type: runbook
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
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
- rate limiting is added if public API exposure creates abuse risk.

## Incident: unexpected usage spike

1. Check provider usage dashboard and key-specific traffic.
2. Verify browser/server key restrictions.
3. Inspect deploy logs for repeated request patterns.
4. Disable public search/deploy if financial exposure is material.
5. Fix request loop/abuse path before restoring.
6. Rotate a key only when compromise is suspected or required; restriction should be the normal first line of defense.
