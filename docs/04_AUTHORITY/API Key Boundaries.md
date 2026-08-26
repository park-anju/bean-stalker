---
id: AUTH-API-KEY-BOUNDARIES
type: authority-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# API Key Boundaries

## Two-key model

### Browser Maps key
Used only where a client-side Maps JavaScript credential is required.

Controls:
- website/referrer application restriction;
- API restriction to only required browser Maps APIs;
- never reused as the server web-service credential;
- safe handling still required even though browser-use keys are necessarily observable by clients.

### Server Places key
Used by `apps/api` for Places API web-service requests.

Controls:
- stored only in server environment/secret storage;
- never serialized to the browser;
- API restriction to required Places service;
- server/network restriction where the deployment platform makes it practical;
- never logged.

## Repository policy

Allowed:
- `.env.example` with placeholder names.

Forbidden:
- real keys in Git history, README examples, screenshots, fixtures, logs or Obsidian notes.

## Example variables

```text
VITE_GOOGLE_MAPS_BROWSER_KEY=<restricted browser key>
GOOGLE_PLACES_SERVER_KEY=<server-only secret>
```

## Rotation response

If a credential is exposed, restrict/rotate it through the provider console, remove it from active environments, and review usage. Git deletion alone does not revoke a leaked secret.

See [[Threat Model]], [[Environment Contract]] and [[ADR-005 Server-Side Places Proxy]].
