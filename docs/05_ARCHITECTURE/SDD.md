---
id: ARCH-SDD
type: architecture-spec
status: approved
version: 1.1
authority: canonical
owner: Project Owner
updated: 2026-09-03
---
# Software Design Description

## 1. Scope

Defines implementation **design intent** for [[MVP Scope]] and [[SRS]].

> **As-built reference.** For the verified current architecture — system
> context, container/runtime layout, the cafe-search sequence, state
> ownership, the location data lifecycle, the cost/abuse guardrail stack, the
> provider abstraction, and the explicit non-goals — see [[System Architecture]]
> (v2.0, H09). This SDD records the design *as planned*; where the two differ,
> [[System Architecture]] §"As-built corrections" is authoritative and this note
> is updated to match.

## 2. Repository layout

```text
Bean Stalker/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   └── contracts/
├── tests/
├── docs/
└── scripts/
```

## 3. Frontend design

### Responsibilities
- acquire/search a location;
- orchestrate cafe queries with TanStack Query;
- render list/map synchronized selection;
- perform local sort/filter;
- manage local favourites;
- represent loading/empty/error/unknown states accurately.

### Routes
- `/` — discovery/search experience;
- `/favorites` — locally saved cafes (may reuse discovery shell).

### State split (as built — see [[System Architecture]] §D)
- **server-derived state:** cafe search response → TanStack Query cache
  (browser-only; the server keeps no copy);
- **route state:** the current path only (`/`, `/favorites`, 404). No search
  parameters are held in the URL — shareable searches are a post-MVP idea
  ([[Productionization Program]] `PRD-07`);
- **transient UI state:** selected cafe id, local filters/sort, location
  resolution state, manual-input fields (React state, never persisted);
- **persistent local state:** favourites only (`localStorage`);
- **server operational state:** in-memory rate-limit windows + monthly
  provider-usage count — abuse/cost control, **not** user or session data.

## 4. API design

Fastify validates requests and delegates to a provider adapter.

```text
request
→ correlation id
→ Zod validation
→ bound radius/result count
→ provider adapter
→ Places request with explicit field mask
→ normalize response
→ safe error mapping
→ response
```

No client-supplied API credential is accepted.

## 5. Provider adapter

Google-specific request/response types remain inside `providers/google-places`. The rest of the application consumes normalized `Cafe` contracts from [[Data Model]].

## 6. Distance calculation

Use a deterministic Haversine helper for straight-line distance from search center. Unit test edge cases. Do not present it as route distance.

## 7. Favourites

Use a versioned localStorage envelope. Parse with Zod; invalid/corrupt data falls back safely. See [[ADR-004 Favorites Local Storage]].

## 8. Error handling

Stable error envelope from [[Error Catalog]] with no provider credentials/internal stack traces.

## 9. Security

Use [[Threat Model]] and [[API Key Boundaries]]. CORS is restricted to expected development/deployment origins when web/API are cross-origin.

## 10. Testing

- unit: distance, filter/sort, favourite parser, provider normalizer;
- component: search/filter cards and state cues;
- API: request validation, provider mapping/errors;
- e2e: mocked provider happy path + failure path.

## 11. Quality gates

A task requires [[Definition of Done]] and evidence in [[Implementation Handoffs]].
