---
id: EXEC-DEFINITION-DONE
type: quality-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Definition of Done

A Bean Stalker task is `DONE` only when:

- implementation matches linked canonical requirements;
- no new known TypeScript/lint error is introduced;
- task-specific tests exist and pass where applicable;
- security/privacy/provider boundaries were considered;
- commands/results are recorded in [[Implementation Handoffs]];
- [[Current Project State]] and [[Task Status]] are updated;
- significant design divergence has an ADR;
- no placeholder is presented as completed live behaviour.

For final P0 release, [[Release Readiness]] also applies.
