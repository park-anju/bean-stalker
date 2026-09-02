---
id: REQ-NONFUNCTIONAL
type: requirements-spec
status: approved
version: 1.1
authority: canonical
owner: Project Owner
updated: 2026-09-03
---
# Non-Functional Requirements

## NFR-001 — security
No committed secrets; browser and server credentials are separately restricted according to [[API Key Boundaries]].

## NFR-002 — privacy
Precise current-location coordinates are not persisted by P0 beyond what is necessary for the active request/cache. See [[Privacy Boundaries]].

## NFR-003 — performance
On a normal broadband connection, local UI interactions (sort/filter/favourite) should feel immediate. Provider-dependent latency is surfaced with a loading state.

## NFR-004 — accessibility
Primary flows are keyboard operable; controls have accessible names; selected/favourite/open states are not conveyed only by color; map is supplementary to a usable list.

**H08 baseline (2026-09-03, [[UX Contract]] §"H08 baseline", [[Implementation Handoffs]] `H08`):** keyboard-only core flow verified (location → search → select → favourite); assertive `role="alert"` for location errors with `aria-invalid`/`aria-describedby` field association; polite `role="status"` for search progress/empty; interactive/link text meets WCAG 2.1 AA contrast; the "Open now only" checkbox meets the WCAG 2.2 24 px target-size minimum; `@axe-core/playwright` scans 9 representative states with zero violations (supplement to manual review, not a conformance claim). Formal wording: *designed and tested against relevant WCAG 2.2 principles with automated and manual keyboard/mobile checks* — not "certified".

## NFR-005 — responsive design
Core flows remain usable at common mobile and desktop widths.

**H08 baseline:** no unintended page-level horizontal scroll at 320–768 px (and at 200% zoom) in any state — initial, results, filtered-empty, empty, error, favourites, 404 — including long / non-ASCII / missing-data cafe content. Automated (Playwright) regression-guarded in `tests/e2e/mobile.spec.ts` and `tests/e2e/accessibility.spec.ts`; **manual landscape verification** (hand-performed 2026-09-03): 667 × 375 and 844 × 390 both PASS.

## NFR-006 — reliability
API/provider failure does not crash the application or silently present stale/empty data as a fresh success.

## NFR-007 — maintainability
TypeScript strictness, shared contracts, bounded modules, linting and tests are required. Avoid `any` as a shortcut.

## NFR-008 — observability
API logs include request correlation, route/outcome/latency and provider failure category without secrets or precise user coordinates at unnecessary precision.

**Logging policy (H02, enforced in `apps/api/src/logging.ts`):** the request
serializer emits only `method` + path (query strings stripped); the client IP
(`remoteAddress`/`remotePort`), hostname and request headers are **not** logged;
the error serializer whitelists `type` + `message` + `stack` and drops every
other own-property so a thrown error cannot carry a raw provider payload into a
log line; a `redact` list removes credential- and coordinate-shaped fields from
any manual log call. Retained: `reqId`, method, path, status code, response
time, and bounded application error codes (`{ providerErrorCode }`). Regression
tests capture emitted log lines and assert conspicuous test coordinates, a fake
key and an attached-payload sentinel never appear.

## NFR-009 — cost discipline
External queries are bounded, duplicate refetches are controlled and Places field masks are minimal.

### RM0 — portfolio no-cost operating constraint

Bean Stalker's public portfolio deployment must be designed to remain within
no-cost third-party usage under expected portfolio traffic. The application must
avoid unnecessary Google Places and Maps requests. **Accidental paid usage is a
release blocker**, not a tuning issue.

- **T07 (frontend request discipline)** — one committed `SearchCenter` produces
  at most one provider request; rerenders, window focus, network reconnect,
  component remount, map pan/zoom, marker/card selection and error auto-retry
  must never issue a provider request; identical fresh searches are served from
  cache. Implemented via [[ADR-007 Cost-Safe Search Orchestration]].
- **Server request discipline (H03/H04/H05, [[ADR-008 Metered Provider Cost Controls]])** —
  a per-client fixed-window rate limit on `POST /api/v1/cafes/search` (429
  `RATE_LIMITED`); a global fail-closed usage guard that consumes one allowance
  unit before each provider attempt, does not refund on provider failure, and
  rejects with 503 `PROVIDER_CAPACITY_EXHAUSTED` once the configured monthly
  attempt cap is reached; validation/rate-limit/guard rejections never reach the
  provider. `CAFE_PROVIDER=live` requires an explicit
  `PROVIDER_MONTHLY_REQUEST_LIMIT`.
- **Still deferred to Google-side / deployment tasks** — Google Cloud daily
  quota caps, budget/usage alerts, production API-key restrictions, a
  **durable/shared** production usage-guard implementation ([[Known Blockers|BLK-004]]),
  `trustProxy` configuration, and live billing-enabled verification. Tracked as
  [[Known Blockers|BLK-003]] / [[Known Blockers|BLK-004]].

## NFR-010 — browser support
Target current evergreen desktop/mobile browsers that support required APIs; unsupported geolocation falls back to manual location selection.
