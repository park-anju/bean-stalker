---
id: DEC-ADR-008
type: decision
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-28
---
# ADR-008 Metered Provider Cost Controls

**Status:** Accepted

## Context

Bean Stalker calls a potentially metered external API (Google Places API New)
and will eventually be publicly reachable. The financial policy
([[Pre-T08 Project Checkpoint]] §4) is: expected spend **RM0/month**, preferred
ceiling **≤ RM5**, tolerated exposure **RM10**, and — when forced to choose —
**prefer service degradation over uncontrolled metered usage**.

T07 already prevents accidental client-side amplification (no search on
rerender / focus / reconnect / mount / map pan-zoom / selection / auto-retry /
polling). T09/T10 kept local filtering, sorting and favourites entirely local.
Those controls do not stop (a) a single client bursting the search endpoint, or
(b) many well-behaved clients collectively exhausting the provider allowance.
The pre-T08 hardening milestone (H02–H05) adds the missing server-side layers.

## Decision

Metered provider attempts are protected by **two independent server-side
controls plus honest degradation**, layered as:

```
T07 client request discipline
        ↓
schema validation
        ↓
per-client fixed-window rate limit   (H03)
        ↓
global fail-closed usage guard       (H04)
        ↓
metered cafe provider
        ↓
Google-side quotas / budget alerts   (T08 / deployment — not in this milestone)
```

1. **Per-client rate limit (H03).** A hand-rolled in-memory fixed-window
   limiter (`FixedWindowRateLimiter`, injectable clock) on
   `POST /api/v1/cafes/search` only. Exceeding it returns **HTTP 429** with the
   canonical Bean Stalker envelope, code **`RATE_LIMITED`**, and a `Retry-After`
   header. `@fastify/rate-limit@11` was evaluated and is Fastify-5 compatible;
   hand-rolling was chosen so the 429 body is exactly the shared error envelope,
   the clock is injectable for deterministic tests, and no runtime dependency is
   added for one route (consistent with T06's hand-rolled Maps loader). The
   client IP is used only as an **ephemeral in-memory Map key** — never logged,
   never persisted.

2. **Global usage guard (H04).** A `ProviderUsageGuard` interface with
   `tryConsume()` / `getStatus()`. `tryConsume()` checks and consumes one
   allowance unit **as one atomic conceptual operation**; the in-memory
   implementation does so synchronously (no `await` between check and
   increment), so concurrent callers can never oversubscribe. A durable/shared
   implementation MUST provide the same atomicity via a single store operation.
   - One unit is consumed **immediately before** a provider attempt is
     dispatched and is **not refunded** if the provider then errors, times out
     or returns a malformed response — an outbound attempt is assumed to
     contribute to billable/operational usage unless proven otherwise.
   - Validation failures and rate-limit rejections **do not consume**; a guard
     rejection means the provider is **never called**.
   - Rejection returns **HTTP 503**, code **`PROVIDER_CAPACITY_EXHAUSTED`**.
   - Period accounting uses a deterministic UTC `YYYY-MM` key with an injectable
     clock; rollover resets the allowance.
   - `PROVIDER_MONTHLY_REQUEST_LIMIT` is validated config, **required when
     `CAFE_PROVIDER=live`** (live mode cannot inherit an unbounded default);
     `0` is a deliberate fully-fail-closed value. `CAFE_PROVIDER=fixture` uses
     an `UnlimitedProviderUsageGuard` so ordinary local development is never
     blocked and fixture requests are never implied to cost money.

3. **Graceful degradation (H05).** 429 (`RATE_LIMITED`) and 503
   (`PROVIDER_CAPACITY_EXHAUSTED`) are distinct codes with distinct, bounded
   user-facing copy. Neither triggers an automatic retry (the query already sets
   `retry: false`); the UI offers an explicit Retry button, keeps the resolved
   location, keeps favourites working, and preserves map/list failure
   isolation. No pricing, counter or infrastructure detail is shown to users.

4. **Metered-provider policy lives at the application/operations boundary.**
   Cost/allowance state is never placed inside `Cafe`, `SearchCenter`, distance,
   filter, sort or favourite logic ([[SDD]] separation of concerns).

## Alternatives considered

- *`@fastify/rate-limit`* — compatible, but customizing its response to the
  Bean Stalker envelope plus its 3 transitive deps outweighed ~40 lines.
- *Refund the usage unit on provider failure* — rejected: a failed outbound
  attempt may still have been dispatched and metered; conservative accounting
  is fail-closed.
- *check() then increment() separately* — rejected: concurrent requests could
  oversubscribe. The atomic single-operation contract is mandatory.
- *Redis / a datastore for the guard now* — rejected: deployment topology is
  undecided; the interface is designed so a durable implementation can be
  dropped in later.
- *One shared 429 for both conditions* — rejected: 503 correctly represents a
  global service-capacity limit vs. a client-specific one.

## Consequences

- A single client cannot burst the search endpoint; the system as a whole
  cannot exceed a configured monthly provider-attempt allowance in-process.
- **The in-memory usage guard is NOT a production financial hard cap.** It
  resets on process restart and is not shared across instances. Public release
  remains blocked until it uses a durable/shared implementation appropriate to
  the chosen deployment topology, **or** an equivalent infrastructure-level hard
  guard (e.g. Google Cloud quota + budget cap) is demonstrably in place —
  tracked as [[Known Blockers|BLK-004]].
- New shared error codes `RATE_LIMITED` and `PROVIDER_CAPACITY_EXHAUSTED`
  ([[Error Catalog]], `openapi.yaml`, `packages/contracts`).
- New validated env: `LOG_LEVEL`, `SEARCH_RATE_LIMIT_MAX`,
  `SEARCH_RATE_LIMIT_WINDOW_MS`, `PROVIDER_MONTHLY_REQUEST_LIMIT`
  ([[Environment Contract]]).
- Deployment must still configure `trustProxy` for the real reverse-proxy
  topology before `request.ip` can be trusted for client identity in production.

Constrains [[API Cost Guardrail Runbook]], [[External Service Constraints]],
[[SDD]], [[Environment Contract]], [[Error Catalog]] and T08. Builds on
[[ADR-005 Server-Side Places Proxy]] and [[ADR-007 Cost-Safe Search Orchestration]].
