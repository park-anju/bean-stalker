---
id: DEMO-GOLDEN-SCENARIO
type: quality-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Golden Demo Scenario

## Purpose

A short, deterministic interview/demo narrative proving the breadth of Bean Stalker without feature wandering.

## Precondition

- deployed/local app is healthy;
- restricted credentials configured;
- provider available;
- browser starts with empty Bean Stalker local storage.

## Scenario

1. Open Bean Stalker on the Discovery screen.
2. Choose **Use my location** and permit access, or choose a known manual location if demonstrating privacy fallback.
3. Search within the default radius.
4. Show real cafe cards and corresponding map markers.
5. Select a cafe card and show marker/detail synchronization.
6. Sort by distance, then by rating.
7. Apply minimum-rating and open-now filter; explain that unknown opening status is not treated as open.
8. Favourite one cafe.
9. Reload and show that favourite remains on this browser.
10. Open the cafe in Google Maps if URI is available.
11. Trigger a controlled mocked/offline error demonstration and show retry/error state differs from empty results.

## Engineering talking points

- React/TypeScript front-end state split;
- TanStack Query lifecycle/caching;
- Fastify server boundary protecting Places web-service credential;
- explicit field mask/cost guardrails;
- Zod validation/shared contract;
- Haversine distance vs route distance distinction;
- localStorage chosen intentionally to keep P0 accountless;
- deterministic mocked provider tests vs manual live smoke test.

## Success

Demo completes without hidden manual data edits, leaked secrets, or claims unsupported by provider data.
