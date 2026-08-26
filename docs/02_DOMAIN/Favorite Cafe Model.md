---
id: DOMAIN-FAVORITE-CAFE
type: domain-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Favorite Cafe Model

## P0 storage

Favourites are browser-local state under [[ADR-004 Favorites Local Storage]].

## Stored shape

A favourite may contain:
- `placeId`;
- `savedAt`;
- compact display snapshot: name, address, coordinates, rating/open status if known at save time.

## Rules

1. `placeId` is the deduplication key.
2. Saving the same cafe twice is idempotent.
3. Removing a favourite deletes only the local favourite record.
4. A stored snapshot is not guaranteed current.
5. Corrupted localStorage data must be ignored/reset safely rather than crash the app.
6. No favourite is uploaded to a backend in P0.

## Future migration

If accounts/cloud sync are added, introduce a new ADR and migration strategy; do not silently redefine this storage model.
