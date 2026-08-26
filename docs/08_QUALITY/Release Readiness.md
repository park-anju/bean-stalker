---
id: QA-RELEASE-READINESS
type: quality-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
---
# Release Readiness

## P0 release checklist

### Scope
- [ ] All P0 functions in [[MVP Scope]] are implemented or explicitly removed by approved scope change.
- [ ] No P1/P2 feature blocks core flow.

### Security/cost
- [ ] No real secret exists in tracked files or build output.
- [ ] Browser Maps key has website + API restrictions.
- [ ] Server Places key is server-only and API-restricted.
- [ ] Field mask is explicit/minimal.
- [ ] Search radius/result count are bounded server-side.
- [ ] Usage/budget guardrail configured where available.

### Behaviour
- [ ] Geolocation denial → manual location works.
- [ ] Live search returns real cafe data.
- [ ] Empty vs error are distinct.
- [ ] Missing optional fields display honestly.
- [ ] List/map selection is coherent.
- [ ] Sort/filter/favourites work.

### Quality
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `pnpm e2e`
- [ ] responsive smoke test
- [ ] keyboard/accessibility smoke test

### Documentation
- [ ] README has setup, env variables, architecture and demo.
- [ ] [[Current Project State]] reflects reality.
- [ ] [[Traceability Matrix]] has evidence links/status.
- [ ] [[Implementation Handoffs]] records final commands/results.
- [ ] Screenshots/GIF added for resume/GitHub if desired.

## Release decision

**Current:** NOT READY — implementation not yet started.
