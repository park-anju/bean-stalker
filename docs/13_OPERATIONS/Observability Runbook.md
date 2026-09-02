---
id: OPS-OBSERVABILITY
type: runbook
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-28
---
# Observability Runbook

## API structured log fields

Enforced by `apps/api/src/logging.ts` (H02, [[ADR-008 Metered Provider Cost Controls]]):

Emitted:
- `reqId` (request correlation, added by Fastify);
- `req: { method, url }` — URL path only, query string stripped;
- `res: { statusCode }`, `responseTime`;
- bounded application error codes (`{ providerErrorCode }`, `{ event }`);
- log level, timestamp, pid/hostname.

Never emitted (removed vs. Fastify defaults):
- `req.remoteAddress` / `req.remotePort` — the client IP is not logged;
- `req.hostname` and request headers;
- the request body / `SearchCenter` / precise coordinates;
- API keys / `X-Goog-Api-Key` / `Authorization` / `Cookie`;
- raw provider response payloads;
- error own-properties other than `type` / `message` / `stack` (a thrown error
  cannot carry an attached `.response` / `.body` into a log line);
- browser localStorage contents.

Regression tests (`apps/api/src/test/logging.test.ts`) capture emitted lines and
assert conspicuous coordinates, a fake key sentinel and an attached-payload
sentinel never appear while method/path/status remain present.

## Failure triage

1. Capture Bean Stalker request ID.
2. Determine validation vs provider vs internal failure.
3. For provider error, inspect status/category without dumping secrets.
4. Check quota/billing/key restrictions.
5. Reproduce with controlled fixture before blaming UI.

## Frontend diagnostics

Development errors may include query status and safe request IDs. Production UI shows human-safe messages from [[Error Catalog]].
