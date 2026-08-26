---
id: OPS-LOCAL-STATE-RECOVERY
type: runbook
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Local State Recovery Runbook

P0 has no server database backup/restore process. Recoverable durable state is limited to browser favourites/preferences.

## Corrupt favourite state

1. Parse through the versioned Zod schema.
2. On invalid state, preserve app availability.
3. Offer/reset only Bean Stalker storage keys.
4. Do not clear all site/browser storage indiscriminately.

## User reset

A future settings action may clear favourites/preferences. Until then, documented browser storage clearing is acceptable for development.

## Future database trigger

If P1/P2 adds server persistence, this runbook is superseded by a real backup/restore ADR and operational procedure.
