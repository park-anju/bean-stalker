---
name: check-requirements
description: Check a Bean Stalker change against linked requirements and domain rules.
argument-hint: "<TASK-ID or scope>"
disable-model-invocation: true
---
# Check Requirements

For `$ARGUMENTS`:
1. Find matching rows in [[Functional Requirements]] / [[Non-Functional Requirements]].
2. Read linked domain/boundary notes.
3. Identify acceptance/test IDs.
4. Report conflicts without silently rewriting specs.
