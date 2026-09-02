---
id: AUTH-API-KEY-BOUNDARIES
type: authority-spec
status: approved
version: 1.1
authority: canonical
owner: Project Owner
updated: 2026-09-03
---
# API Key Boundaries

## Classification (H06 / [[ADR-009 API Security Posture]])

| Credential | Class | Where |
|---|---|---|
| `GOOGLE_PLACES_SERVER_KEY` | **SECRET** | server env only; the only secret Bean Stalker holds |
| `VITE_GOOGLE_MAPS_BROWSER_KEY` | **public config** | inlined into the browser bundle; not a secret |
| `VITE_GOOGLE_MAPS_MAP_ID` | **public config** | inlined into the browser bundle; not a secret |

"Public config" means: intentionally browser-visible, protected **Google-side**
by referrer + API restrictions — not by concealment. Do not call the browser
key or Map ID a secret.

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
- `.env.example` with placeholder names + a sensitivity classification comment.

Forbidden:
- real keys in Git history, README examples, screenshots, fixtures, logs or Obsidian notes.

Enforced:
- `.gitignore` covers `.env` and `.env.*` except `.env.example`; local secret
  files (`apps/api/.env`, `apps/web/.env.local`) are untracked;
- `GOOGLE_PLACES_SERVER_KEY` is `optional()` at the env schema level and
  required only when `CAFE_PROVIDER=live` — fixture dev/CI needs no credential;
- `apps/web`'s `build` runs `scripts/check-frontend-dist-secrets.mjs` and
  **fails** if `dist/` contains a server-only marker
  (`GOOGLE_PLACES_SERVER_KEY`, `X-Goog-Api-Key`, `places.googleapis.com`);
- env validation errors print `field: reason`, never the value;
- git history checked (H06): no real Google key pattern present.

## Example variables

```text
VITE_GOOGLE_MAPS_BROWSER_KEY=<restricted browser key>
GOOGLE_PLACES_SERVER_KEY=<server-only secret>
```

## Rotation response

If a credential is exposed, restrict/rotate it through the provider console, remove it from active environments, and review usage. Git deletion alone does not revoke a leaked secret.

See [[Threat Model]], [[Environment Contract]] and [[ADR-005 Server-Side Places Proxy]].
