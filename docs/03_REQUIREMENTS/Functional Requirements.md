---
id: REQ-FUNCTIONAL
type: requirements-spec
status: approved
version: 1.1
authority: canonical
owner: Project Owner
updated: 2026-09-19
---
# Functional Requirements

| ID | Requirement | Primary source |
|---|---|---|
| FR-001 | Discover automatically requests current location when no usable session location exists. | [[Location Resolution]] |
| FR-002 | Normal user UI does not expose raw latitude/longitude entry or precise current coordinates. | [[Location Resolution]] |
| FR-003 | Resolving a current location automatically triggers nearby cafe search through the existing query pipeline. | [[Search Lifecycle]] |
| FR-004 | System returns normalized cafe results from Google Places in live mode. | [[Cafe Discovery Model]] |
| FR-005 | Results render as both list and map markers. | [[UX Contract]] |
| FR-006 | Selecting a card/marker highlights the corresponding cafe. | [[UX Contract]] |
| FR-007 | Cafe information shows available name/address/rating/count/price/open status/distance. | [[Cafe Discovery Model]] |
| FR-008 | User can sort by distance. | [[Ranking and Filtering Rules]] |
| FR-009 | User can sort by rating. | [[Ranking and Filtering Rules]] |
| FR-010 | User can filter by minimum rating. | [[Ranking and Filtering Rules]] |
| FR-011 | User can filter to cafes known open now. | [[Ranking and Filtering Rules]] |
| FR-012 | User can favourite/unfavourite a cafe. | [[Favorite Cafe Model]] |
| FR-013 | Favourites persist across reload on the same browser/device. | [[Favorite Cafe Model]] |
| FR-014 | User can view/filter favourites. | [[Favorite Cafe Model]] |
| FR-015 | User sees explicit loading, empty, permission-error and provider-error states. | [[Search Lifecycle]] |
| FR-016 | User can retry a failed search. | [[Search Lifecycle]] |
| FR-017 | User can open a cafe in Google Maps when URI is available. | [[Cafe Discovery Model]] |
| FR-018 | System validates and bounds search parameters before provider call. | [[Business Rules]] |
| FR-019 | Health endpoint reports API process availability without leaking secrets. | [[API Contract]] |
| FR-020 | Recoverable location failures provide bounded guidance and an explicit user-triggered retry without automatic loops. | [[Location Resolution]] |
