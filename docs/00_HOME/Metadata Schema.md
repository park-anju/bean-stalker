---
id: HOME-METADATA-SCHEMA
type: governance
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Metadata Schema

## Required frontmatter

```yaml
---
id: DOMAIN-SEARCH-LIFECYCLE
type: domain-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
```

## Controlled values

### `status`
- `draft`
- `active`
- `approved`
- `superseded`
- `archived`

### `authority`
- `canonical`
- `derived`
- `execution`
- `navigation`
- `source`

### Recommended `type`

`business-spec`, `domain-spec`, `requirements-spec`, `authority-spec`, `architecture-spec`, `interface-spec`, `quality-spec`, `execution-state`, `decision`, `catalog`, `runbook`, `session`, `map-of-content`, `governance`.

## Stable ID rule

IDs do not change when filenames are improved. Never reuse an ID for a different meaning.
