---
id: GOV-EXTERNAL-DEPENDENCY
type: governance
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# External Dependency Policy

## Provider dependencies

- Google Maps JavaScript API;
- Google Places API (New).

## Library dependencies

Prefer mature, directly useful packages with a clear role. Do not add a library for functionality that is trivial and safer to own locally.

## Upgrade policy

- pin through lockfile after T00;
- review breaking changes before upgrades;
- keep provider adapter isolated from the rest of the domain;
- CI/build failures after upgrades are resolved rather than suppressed;
- security advisories affecting public deployment are triaged before release.

## Test isolation

Normal unit/integration tests use fixtures/mocks and do not incur live Maps Platform calls. A separate manual smoke test may exercise live credentials.
