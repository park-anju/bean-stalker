---
name: start-task
description: Start a Bean Stalker task with dependency, context and test checks.
argument-hint: "<TASK-ID or scope>"
disable-model-invocation: true
---
# Start Task

For `$ARGUMENTS`:
1. Read [[Task Status]] and [[Task Graph]].
2. Do not start if dependencies are not DONE or task is BLOCKED.
3. Read only linked canonical specifications.
4. State objective, expected files/boundaries, exclusions, tests and assumptions.
5. Update [[Current Execution Focus]] and task to IN_PROGRESS only when work actually begins.
