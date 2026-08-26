---
id: AUTH-EXTERNAL-CONSTRAINTS
type: authority-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# External Service Constraints

## Google Maps Platform

Bean Stalker depends on provider availability, quotas, billing, field availability, attribution/policy requirements and API evolution.

## Design consequences

1. Provider responses are treated as external/untrusted input and normalized.
2. API errors are mapped to [[Error Catalog]].
3. Request size/radius/result count are bounded before provider call.
4. Production field masks request only fields required by [[MVP Scope]].
5. The app has a useful failure/retry state when provider calls fail.
6. Tests do not depend on live Google traffic by default.
7. Provider-specific types/fields stay inside the integration adapter where practical.

## Provider-policy checkpoint

Before public deployment, review current Maps/Places display, attribution, caching and key-restriction requirements. Record any implementation-changing decision in [[Decision Index]].
