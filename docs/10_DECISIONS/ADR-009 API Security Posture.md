---
id: DEC-ADR-009
type: decision
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-09-03
---
# ADR-009 API Security Posture & Credential Classification

**Status:** Accepted

## Context

Bean Stalker will eventually be publicly reachable. It handles sensitive
location input and calls a metered external API, but it has **no user accounts,
no cookies used for auth, no user database, and no mutation endpoints** (`GET
/health`, `POST /api/v1/cafes/search`; favourites are browser-local). The
pre-T08 hardening milestones H02–H05 covered logging privacy and metered-cost
controls. H06/H07 add the remaining configuration and API-surface hardening.
The decisions must match the real threat model — no security theatre.

## Decision

### 1. Credential classification (H06)

| Value | Class | Protected by |
|---|---|---|
| `GOOGLE_PLACES_SERVER_KEY` | **SECRET** | server-only env; never `VITE_`-prefixed; never in the frontend build (build-time scan); never logged (H02); referrer is not a defence for a web‑service key — API + IP restriction is (BLK‑003) |
| `VITE_GOOGLE_MAPS_BROWSER_KEY`, `VITE_GOOGLE_MAPS_MAP_ID` | **public config** | Google-side HTTP‑referrer + Maps‑JS API restrictions (BLK‑003). Intentionally browser-visible — **not secrets**; hiding them is not the control. |
| everything else (`PORT`, `WEB_ORIGIN`, `LOG_LEVEL`, `CAFE_PROVIDER`, `GOOGLE_PLACES_TIMEOUT_MS`, `SEARCH_RATE_LIMIT_*`, `PROVIDER_MONTHLY_REQUEST_LIMIT`, `VITE_API_BASE_URL`) | **operational config** | validated env (schema/range/enum), safe defaults |

The full inventory (owner / sensitivity / required-in / default / validation)
lives in [[Environment Contract]].

### 2. Fail-closed live configuration (H06)

`CAFE_PROVIDER=live` **fails env validation** without `GOOGLE_PLACES_SERVER_KEY`
and `PROVIDER_MONTHLY_REQUEST_LIMIT`. `CAFE_PROVIDER=fixture` requires neither —
routine local development needs no credential. Both keys are `optional()` at the
schema level and required via a `superRefine` gated on `live`. Validation errors
print `field: reason`, never the offending value (a bad secret is never echoed).

### 3. Origin validation (H06)

`WEB_ORIGIN` and `VITE_API_BASE_URL` use a shared `HttpOriginSchema`
(`packages/contracts`): a bare `http(s)://host[:port]`, a lone trailing slash
tolerated and normalised, anything with a path/query/fragment or a non‑http
scheme rejected — a malformed origin cannot silently propagate into CORS or the
client's request base.

### 4. Frontend build secret gate (H06)

`apps/web`'s `build` script runs `scripts/check-frontend-dist-secrets.mjs`,
which fails the build if `apps/web/dist` contains `GOOGLE_PLACES_SERVER_KEY`,
`X-Goog-Api-Key`, `places.googleapis.com`, or a supplied CI sentinel. The
browser Maps key/Map ID are expected in the bundle and are not flagged.

### 5. API security surface (H07)

- **CORS:** strict single configured origin (`@fastify/cors` with a string —
  never reflects an arbitrary `Origin`). CORS is a **browser** control, not a
  boundary against direct HTTP clients.
- **Security headers** on every response, via a small explicit `onSend` hook
  (not `@fastify/helmet` — a JSON API gains nothing from most of what helmet
  emits): `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`,
  `X-Frame-Options: DENY`. **Deliberately omitted:** CSP (page directive),
  HSTS (needs the deployment HTTPS story — BLK‑003), Permissions‑Policy /
  COOP / CORP (no value over strict single-origin CORS; CORP risks breaking
  legitimate web-client fetches).
- **Body limit:** `16 KiB` (`bodyLimit`) — the only body is the ~150‑byte
  search request. An over-limit body is rejected during parsing, **before** the
  rate limiter, usage guard or provider, so `provider calls = 0` and
  `usage consumed = 0`.
- **Request timeout:** `20 s` (`requestTimeout`) — above the 10 s outbound
  provider timeout + processing; drops a client that opens a connection and
  never finishes its body.
- **Surface area:** a `setNotFoundHandler` returns the canonical envelope with
  code **`NOT_FOUND`** (404) for unknown routes and unsupported methods on
  known paths — Fastify's default 404 would echo the route pattern.
- **`trustProxy`:** left at the default (`false`). `request.ip` is the socket
  address, meaningful only for a direct connection. A deployment behind a
  reverse proxy must configure the exact trusted hop before that identity is
  used for rate limiting — **still deferred to BLK‑003**.

### 6. What is NOT added

No authentication, sessions, JWT, CSRF machinery, OAuth, captcha, WAF, IDS,
database encryption. Bean Stalker has none of the systems those defend.

## Consequences

- Live mode cannot start with missing/unsafe credential config.
- A server secret cannot reach the browser bundle without failing the build.
- The API returns only the canonical envelope for every failure, including
  404/405 and over-limit bodies, and leaks no path/pattern/limit/stack.
- H02–H05 semantics are preserved (the new checks all run before the H03/H04
  pipeline).
- New shared error code `NOT_FOUND` ([[Error Catalog]], `openapi.yaml`,
  `packages/contracts`).
- Production still needs: Google-side key restrictions + quotas + budget
  ([[Known Blockers|BLK-003]]), a durable usage guard ([[Known Blockers|BLK-004]]),
  HSTS + `trustProxy` for the chosen topology.

Constrains [[Environment Contract]], [[Threat Model]], [[API Key Boundaries]],
[[Error Catalog]], `openapi.yaml`. Builds on
[[ADR-005 Server-Side Places Proxy]] and [[ADR-008 Metered Provider Cost Controls]].
