---
name: verify-search-flow
description: Verify the Bean Stalker search flow against lifecycle and error rules.
argument-hint: "<TASK-ID or scope>"
disable-model-invocation: true
---
# Verify Search Flow

Trace current/manual location → validated search → API/provider adapter → normalized cafes → list/map → filter/favourite. Verify empty/error/UNKNOWN semantics, race handling and key boundaries using [[Search Lifecycle]], [[Business Rules]] and [[Error Catalog]].
