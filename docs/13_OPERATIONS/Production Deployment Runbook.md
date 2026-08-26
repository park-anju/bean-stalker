---
id: OPS-PRODUCTION-DEPLOYMENT
type: runbook
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Production Deployment Runbook

## Preconditions

- [[Release Readiness]] quality gates pass;
- deployment provider selected (resolve [[Open Questions|OQ-001]]);
- HTTPS available;
- web/API origins known;
- restricted credentials created for production.

## Deployment requirements

1. Build web/API from clean lockfile.
2. Inject server secret through deployment secret storage, never source.
3. Set browser key website restrictions to exact production origin(s).
4. Restrict browser key to required Maps browser APIs.
5. Restrict server key to Places API and deployment/server context where possible.
6. Configure API CORS to expected web origin.
7. Smoke `/api/v1/health` without making a provider call.
8. Perform one controlled live cafe search.
9. Check logs for secret/location leakage.
10. Run [[Golden Demo Scenario]].

## Rollback

Revert to last known-good deployment artifact. Credential rotation is separate from application rollback.
