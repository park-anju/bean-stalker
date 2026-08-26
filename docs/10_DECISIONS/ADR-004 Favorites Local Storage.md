---
id: DEC-ADR-004
type: decision
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# ADR-004 Favorites Local Storage

**Status:** Accepted

## Decision

Persist P0 favourites in localStorage.

## Context
Accounts/database/cloud sync would expand a three-day cafe finder into identity/data-platform work.

## Decision
Store versioned favourite cafe snapshots locally in browser storage.

## Consequences
- no backend/database needed for favourites;
- favourites are device/browser-specific;
- corrupted storage must be handled safely;
- future cloud sync requires a new decision/migration.

Constrains [[Favorite Cafe Model]] and [[Data Model]].
