---
id: AUTH-CAPABILITY-MATRIX
type: authority-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Capability Matrix

Bean Stalker P0 has no authenticated roles. This matrix defines capability ownership by execution boundary.

| Capability | Browser web | Bean Stalker API | Google provider |
|---|:---:|:---:|:---:|
| Request browser geolocation | ✅ | — | — |
| Render map | ✅ | — | Maps JS supplies data/runtime |
| Select manual location | ✅ | — | Maps JS location tooling |
| Validate UI form | ✅ | ✅ authoritative | — |
| Bound search radius/result count | hint | ✅ | provider also validates |
| Hold Places web-service secret | ❌ | ✅ | receives credential |
| Call Places Nearby Search web service | ❌ P0 | ✅ | ✅ endpoint |
| Normalize provider cafe response | optional display | ✅ canonical contract boundary | source |
| Sort/filter current result set | ✅ | — | — |
| Store favourites | ✅ local only | ❌ | ❌ |
| Persist user precise-location history | ❌ | ❌ | provider processing per its service terms |

See [[API Key Boundaries]] and [[Privacy Boundaries]].
