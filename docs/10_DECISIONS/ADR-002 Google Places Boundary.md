---
id: DEC-ADR-002
type: decision
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# ADR-002 Google Places Boundary

**Status:** Accepted

## Decision

Normalize Google Places behind an adapter.

## Context
Raw Google schemas are external and can change. Spreading provider fields through React would couple the whole app to one API.

## Decision
Keep provider request/response mapping inside a Google Places adapter and expose normalized `Cafe` contracts.

## Consequences
- provider changes are localized;
- tests can use deterministic fixtures;
- some mapping code is required;
- Bean Stalker remains intentionally Google-backed in P0, not falsely provider-neutral.

Constrains [[Data Model]], [[API Contract]] and [[External Service Constraints]].
