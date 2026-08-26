---
id: OPS-PERFORMANCE-TEST
type: runbook
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Performance Test Plan

## Goal

Keep a portfolio MVP responsive while preventing accidental external API amplification.

## PERF-001 — local interactions

Sort/filter/favourite actions should update without network calls and without visible jank on a 20-result set.

## PERF-002 — search request count

A single deliberate search intent should produce one application search request, excluding an intentional retry/revalidation. Incidental component rerenders must not multiply provider calls.

## PERF-003 — provider latency handling

Artificially delay the mocked API and verify stable loading UX and no duplicate submissions.

## PERF-004 — rapid search supersession

Trigger two searches rapidly; ensure the older response cannot overwrite the newer intent.

## PERF-005 — bundle sanity

Review production bundle for obvious accidental heavy dependencies and verify server secret is absent.

## Note

A three-day portfolio project does not need synthetic high-RPS load testing against Google. If the public API attracts traffic, add server-side rate limiting under [[Productionization Program]].
