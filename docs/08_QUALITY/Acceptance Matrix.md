---
id: QA-ACCEPTANCE-MATRIX
type: quality-spec
status: approved
version: 1.1
authority: canonical
owner: Project Owner
updated: 2026-09-19
---
# Acceptance Matrix

| Acceptance ID | P0 evidence required | Status |
|---|---|---|
| AC-01 | Automatic current-location success/error/retry paths demonstrated; prompt does not become premature denial; Permissions API optional; raw coordinate UI absent | VERIFIED — fixture/mock unit + Playwright coverage (2026-09-19) |
| AC-02 | Live search works with restricted credentials in manual smoke test | PLANNED |
| AC-03 | List + map render same normalized result set | PLANNED |
| AC-04 | Sort/filter rules pass tests | PLANNED |
| AC-05 | Favourites persist locally and corruption is safe | PLANNED |
| AC-06 | Permission/API/empty states are distinct | PLANNED |
| AC-07 | Server-side key absent from browser build/source control | PLANNED |
| AC-08 | `lint`, `typecheck`, `test`, `build`, `e2e` pass | PLANNED |
| AC-09 | README/setup/architecture/demo documentation complete | PLANNED |
| AC-10 | Golden demo can be executed from a clean environment | PLANNED |

Update status only with evidence in [[Implementation Handoffs]].
