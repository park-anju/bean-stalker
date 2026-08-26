---
id: DEMO-SEED-CATALOG
type: catalog
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Seed Data Catalog

Bean Stalker has no database seeds. “Seed” means deterministic provider fixtures used for development/tests.

## Fixture set

### `nearby-cafes-happy.json`
Contains 4–6 normalized/provider-like cafe results covering:
- highly rated cafe;
- unrated cafe;
- open cafe;
- closed cafe;
- unknown hours;
- optional missing price/address fields.

### `nearby-cafes-empty.json`
Successful provider response with zero cafes.

### `nearby-cafes-malformed.json`
Unexpected/missing required provider shape to verify safe adapter failure.

### provider error fixtures
- auth/config rejection;
- rate/quota rejection;
- transient 5xx.

## Rule

Fixtures are visibly test data and are never represented as live Google results in production/demo mode.
