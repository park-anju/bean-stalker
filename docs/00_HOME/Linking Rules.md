---
id: HOME-LINKING-RULES
type: governance
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Linking Rules

1. Link semantic relationships, not every repeated noun.
2. A derived note links its canonical upstream source.
3. Requirements link to relevant domain rules and acceptance evidence.
4. ADRs link to the artifacts they constrain.
5. Execution tasks link to exact specifications needed for implementation.
6. Session notes link to tasks and decisions changed during the session.
7. Do not create duplicate notes just to improve graph density.

## Preferred relationship language

- `governed by [[Business Rules#BR-04 — live-data integrity|BR-04]]`
- `implemented according to [[ADR-005 Server-Side Places Proxy]]`
- `verified by [[Test Case Catalog#Search|TC-SEARCH-004]]`
- `blocked by [[Open Questions|OQ-002]]`

The graph is a consequence of meaningful relationships, not a target metric.
