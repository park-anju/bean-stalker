---
id: ARCHIVE-VAULT-VALIDATION-V1
type: governance
status: approved
version: 1.0
authority: derived
owner: Project Owner
updated: 2026-08-27
---
# Bean Stalker Vault Validation Record

Generated package validation is performed with `node scripts/validate-brain.mjs` before ZIP creation.

Expected checks:
- required files exist;
- governed Markdown has YAML frontmatter;
- note IDs are unique;
- Obsidian wiki links resolve by note stem/path;
- execution JSON files parse.

## Packaging result

```text
Bean Stalker brain validation PASSED: 22 required files, 74 governed notes, 74 unique note IDs, 0 unresolved wiki links.
```

This was executed against the generated vault before ZIP creation. Re-run after extraction with `npm run brain:validate` or `node scripts/validate-brain.mjs`.
