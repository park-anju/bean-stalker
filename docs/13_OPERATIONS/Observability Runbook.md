---
id: OPS-OBSERVABILITY
type: runbook
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Observability Runbook

## API structured log fields

Recommended:
- timestamp;
- request ID;
- route;
- method;
- outcome/status;
- latency ms;
- provider outcome category;
- app version/environment.

Avoid:
- API keys/authorization headers;
- full raw provider payloads;
- precise user coordinates unless a temporary controlled diagnostic explicitly requires them;
- browser localStorage contents.

## Failure triage

1. Capture Bean Stalker request ID.
2. Determine validation vs provider vs internal failure.
3. For provider error, inspect status/category without dumping secrets.
4. Check quota/billing/key restrictions.
5. Reproduce with controlled fixture before blaming UI.

## Frontend diagnostics

Development errors may include query status and safe request IDs. Production UI shows human-safe messages from [[Error Catalog]].
