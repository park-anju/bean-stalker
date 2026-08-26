---
id: DEC-ADR-005
type: decision
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# ADR-005 Server-Side Places Proxy

**Status:** Accepted

## Decision

Use a server boundary for Places web-service search.

## Context
Nearby Search (New) is a web-service call and server-side provider credentials should not be exposed to an untrusted browser. The map UI still needs a separately restricted browser Maps credential.

## Decision
`apps/web` calls `apps/api`; `apps/api` validates/bounds requests and calls the Places web service using a server-only credential.

## Consequences
- server secret remains outside browser bundles;
- API can enforce field masks and request limits;
- requires deployment of a backend boundary;
- browser and server credentials are separate.

Constrains [[API Key Boundaries]], [[API Contract]] and [[System Architecture]].
