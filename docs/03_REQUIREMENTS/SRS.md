---
id: REQ-SRS
type: requirements-spec
status: approved
version: 1.1
authority: canonical
owner: Project Owner
updated: 2026-09-19
---
# Software Requirements Specification

## 1. Purpose

This SRS defines observable P0 behaviour for [[MVP Scope]]. Domain meaning comes from [[Cafe Discovery Model]], [[Search Lifecycle]] and [[Business Rules]].

## 2. Actors

### Visitor
Anonymous user of the web application. No account or server-side profile exists in P0.

### Google Maps Platform
External provider supplying map capability and Places data. It is not a trusted product actor; responses are validated/normalized at integration boundaries.

## 3. System context

```mermaid
flowchart LR
  U[Visitor] --> W[Bean Stalker Web]
  W --> GJS[Google Maps JavaScript API]
  W --> A[Bean Stalker API]
  A --> GP[Google Places API New]
  W --> LS[(Browser localStorage)]
```

## 4. Primary use cases

### UC-01 Discover cafes from current location
1. Visitor opens Discover; the app requests current location once when no usable session location exists.
2. The app calls Web Geolocation once; the browser may show its native permission
   UI and then returns coordinates or a permission/error outcome.
3. On success the app creates a valid search center.
4. The resolved center automatically enables the existing cafe search.
5. API validates request, calls provider with bounded parameters/field mask, normalizes results.
6. Web renders list + markers.
7. Visitor can refine results.

### UC-03 Save favourites
1. Visitor selects favourite action on a cafe.
2. App stores idempotent local favourite snapshot.
3. Reload preserves it on the same browser/device.
4. Removing favourite updates local state.

### UC-04 Recover from failure
- permission denial → settings guidance + explicit retry;
- unavailable/timeout/unexpected location → bounded error + explicit retry;
- unsupported geolocation or insecure production context → distinct bounded non-retryable state;
- provider/network failure → error state + retry;
- empty result → explicit empty state, not error.

There is no human-friendly manual place/address fallback in the current scope.
Raw coordinate entry is not exposed to users.
The Permissions API is not a hard dependency. Bean Stalker cannot control native
permission UI, override a saved browser/site denial or enable device/OS location
services. Production geolocation requires HTTPS; localhost is supported for development.

## 5. Functional requirements

Canonical list: [[Functional Requirements]].

## 6. Data requirements

Canonical shapes: [[Data Model]] and `docs/06_INTERFACES/openapi.yaml`.

## 7. Security/privacy requirements

Governed by [[API Key Boundaries]], [[Privacy Boundaries]], [[Threat Model]] and [[Data Handling Policy]].

## 8. External dependency requirements

- provider timeouts/errors mapped to stable Bean Stalker errors;
- production field masks are explicit;
- request radius/result count are server-bounded;
- client cannot provide/override provider credential;
- attribution/provider policy requirements must be respected during UI implementation.

## 9. User interface requirements

Governed by [[UX Contract]] and [[Screen Inventory]].

## 10. Quality requirements

Governed by [[Non-Functional Requirements]], [[Test Strategy]], [[Acceptance Matrix]] and [[Release Readiness]].

## 11. Acceptance

P0 is accepted only when traceable evidence exists in [[Traceability Matrix]] and [[Implementation Handoffs]].
