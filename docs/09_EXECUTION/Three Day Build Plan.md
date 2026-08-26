---
id: EXEC-THREE-DAY-PLAN
type: execution-state
status: approved
version: 1.0
authority: execution
owner: Project Owner
updated: 2026-08-27
---
# Three Day Build Plan

## Day 1 — foundation + discovery shell

### Morning
- T00 workspace/bootstrap
- T01 shared contracts/env
- T02 domain helpers
- T03 app shell/layout

### Afternoon
- T04 location acquisition/manual selection
- T05 Fastify search endpoint + provider adapter fixtures

### Night
- T06 map integration
- T07 list/marker synchronized results

**Day-1 exit:** mocked/fixture-backed discovery flow is coherent end to end; live credentials may still be pending.

## Day 2 — live integration + product features

- T08 live Places smoke integration
- T09 filtering/sorting
- T10 favourites
- T11 error/empty/loading/race handling
- T12 responsive/accessibility polish

**Day-2 exit:** core MVP complete locally with deterministic tests and manual live search when credentials exist.

## Day 3 — verification + resume packaging

- T13 automated tests/hardening
- T14 deployment
- T15 documentation, screenshots, final demo and resume evidence

## Scope kill order if time collapses

Cut in this order before sacrificing correctness:
1. favourites route polish (keep basic toggle/local persistence);
2. manual rank preference UI (keep distance/rating local sort);
3. decorative animation;
4. nonessential settings.

Never cut credential safety, error distinction, manual location fallback or basic tests merely to add visual features.
