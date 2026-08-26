---
id: QA-TEST-CASES
type: catalog
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Test Case Catalog

## Location

- **TC-LOC-001** granted geolocation produces valid search center.
- **TC-LOC-002** denied permission exposes manual location path.
- **TC-LOC-003** unavailable/timeout does not crash app.
- **TC-LOC-004** invalid coordinates are rejected before search.

## Search

- **TC-SEARCH-001** valid request renders normalized cafes.
- **TC-SEARCH-002** zero provider results renders EMPTY, not error.
- **TC-SEARCH-003** newer search cannot be overwritten by older response.
- **TC-SEARCH-004** radius/result-count bounds enforced server-side.
- **TC-SEARCH-005** provider failure maps to stable error.
- **TC-SEARCH-006** minimal field mask is used by provider adapter.

## Mapping/data

- **TC-MAP-001** provider fields normalize to `Cafe`.
- **TC-MAP-002** missing optional fields stay absent/UNKNOWN.
- **TC-MAP-003** distance calculation is within expected tolerance.

## Filters

- **TC-FILTER-001** distance ascending.
- **TC-FILTER-002** rating descending, missing ratings last.
- **TC-FILTER-003** open filter excludes CLOSED and UNKNOWN.
- **TC-FILTER-004** reset restores default result set.
- **TC-FILTER-005** minimum-rating filter excludes unrated cafes and cafes below the threshold; a zero/absent threshold does not exclude unrated cafes.

## Favourites

- **TC-FAV-001** add favourite is idempotent.
- **TC-FAV-002** remove favourite works.
- **TC-FAV-003** reload preserves valid local favourites.
- **TC-FAV-004** corrupt localStorage falls back safely.

## Errors/UI

- **TC-ERR-001** provider error differs from empty success.
- **TC-ERR-002** retry reissues current search intent once.
- **TC-ERR-003** request abort does not show alarming error.
- **TC-UI-001** card/marker selection syncs.
- **TC-UI-002** missing data has honest labels.
- **TC-UI-003** mobile layout retains primary flow.
- **TC-UI-004** Maps URI action appears only when available.

## Security

- **TC-SEC-001** no server key appears in built web assets.
- **TC-SEC-002** API responses/log fixtures do not include credentials.
- **TC-SEC-003** malformed/oversized input is rejected safely.
- **TC-SEC-004** precise user coordinates are not written to favourite storage/history.

## Accessibility

- **TC-A11Y-001** primary controls keyboard operable.
- **TC-A11Y-002** favourite pressed state has accessible semantics.
- **TC-A11Y-003** map-only information has list equivalent.
