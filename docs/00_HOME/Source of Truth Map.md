---
id: HOME-SOURCE-OF-TRUTH
type: governance
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Source of Truth Map

## Precedence

| Rank | Authority | Canonical artifact | Owns |
|---:|---|---|---|
| 1 | Source brief | [[Source Brief]] | Original intent and explicit constraints |
| 2 | Business baseline | [[BRD]] | Product goals, users, value and high-level requirements |
| 3 | Release boundary | [[MVP Scope]] | Three-day P0 inclusion and deferral |
| 4 | Domain semantics | [[Cafe Discovery Model]], [[Search Lifecycle]], [[Business Rules]] | Search/favourite/location meaning and invariants |
| 5 | Observable behaviour | [[SRS]], [[Functional Requirements]] | User-visible system behaviour |
| 6 | Boundaries | [[API Key Boundaries]], [[Privacy Boundaries]], [[External Service Constraints]] | Trust, privacy and provider constraints |
| 7 | Architecture decisions | [[Decision Index]] and accepted ADRs | Significant technical choices |
| 8 | System design | [[SDD]], [[Data Model]], [[System Architecture]] | Components, data and implementation boundaries |
| 9 | Interface contract | `openapi.yaml`, [[API Contract]], [[Error Catalog]], [[UX Contract]] | HTTP and screen contracts |
| 10 | Verification | [[Test Strategy]], [[Acceptance Matrix]], [[Traceability Matrix]] | Evidence required for acceptance |
| 11 | Execution state | [[Current Project State]], [[Task Status]], [[Implementation Handoffs]] | What is actually implemented and verified |

## Conflict protocol

1. Identify exact conflicting statements.
2. Record the conflict in [[Open Questions]] with an `OQ-*` identifier.
3. Decide whether current work can continue without assuming an answer.
4. If not, block the task in [[Task Status]] and [[Known Blockers]].
5. Resolve the canonical source first, then update derived notes.
6. Record significant architecture change as an ADR.

## Prohibited behaviour

- no “latest file wins” rule;
- no silent agent reconciliation;
- no implementation detail overriding a product invariant;
- no UI success state used as proof that external data is current;
- no task marked complete merely because code exists.
