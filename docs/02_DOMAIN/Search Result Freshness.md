---
id: DOMAIN-RESULT-FRESHNESS
type: domain-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Search Result Freshness

## Principle

Nearby cafe data can change. Caching improves responsiveness and cost control but cannot turn old provider data into “live” truth.

## P0 policy

- TanStack Query may cache search responses keyed by normalized search center/radius/rank parameters.
- Suggested `staleTime`: short, on the order of minutes, chosen during implementation and tested.
- A cached response may render immediately while a revalidation occurs.
- `fetchedAt` is carried in the normalized response for diagnostics and optional UI disclosure.

## Never cache as authoritative forever

Opening status, ratings and business status can change. Favourites store snapshots for convenience only and should not be presented as refreshed live details without a new provider request.

## Cost-aware retrieval

Avoid refetch loops caused by map re-renders, uncontrolled coordinate jitter or repeated identical query keys. See [[API Cost Guardrail Runbook]].
