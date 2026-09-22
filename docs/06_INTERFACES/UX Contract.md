---
id: IFACE-UX-CONTRACT
type: interface-spec
status: approved
version: 1.2
authority: canonical
owner: Project Owner
updated: 2026-09-19
---
# UX Contract

## Core principle

The list is the accessible information surface; the map is a spatial enhancement, not the only way to use Bean Stalker.

## Discovery states

### Initial
Explain why current location is needed and automatically begin location resolution once.

### Locating
Show location progress while the browser's Geolocation request is unresolved,
including while native permission UI is pending. Do not show blocked guidance until
the request fails. On failure, show bounded guidance and an explicit retry where meaningful.

### Searching
Begin automatically after location resolves. Keep layout stable; show clear progress; do not duplicate requests on incidental rerenders.

### Results
List and map represent the same current result set. Card/marker selection is synchronized.

### Empty
State that no matching cafes were returned for the current area/filters; offer radius/filter adjustment.

### Error
Explain that search failed without pretending there are zero cafes. Offer explicit retry as relevant.

## Location controls

- Do not ask normal users to enter raw latitude/longitude.
- Do not display precise current coordinates in status copy.
- The initial successful location resolution starts discovery without a Search click.
- No dedicated Search button exists today; provider retry remains an explicit action.
- A human-friendly manual place/address fallback is a future UX item, not part of the current flow.
- Native permission UI is owned by the browser. Copy must not imply Bean Stalker can
  reopen it, override a site block, or enable device/OS location services.
- Production geolocation requires HTTPS; localhost is the development exception.

## Cafe data cues

- missing rating → `No rating data` or omit cleanly;
- unknown opening state → `Hours unavailable`, never `Closed`;
- distance → approximate straight-line label/tooling;
- favourite → obvious toggle with accessible pressed state.

## Accessibility

- keyboard-accessible controls;
- semantic buttons/labels;
- visible focus;
- map actions have equivalent list actions;
- status messages use suitable live-region semantics where useful;
- do not encode rating/open/favourite state only by color.

### H08 baseline (tested 2026-09-03, [[Implementation Handoffs]] `H08`)

- **Target viewports:** 320 / 360 / 375 / 390 / 430 / 768 px — *automated*
  browser verification (Playwright headless Chromium). No unintended
  page-level horizontal scroll at 320 px in any state (asserted in
  `tests/e2e/mobile.spec.ts` and `accessibility.spec.ts`).
- **Manual landscape verification (hand-performed, 2026-09-03):** 667 × 375
  and 844 × 390 both PASS — no clipped controls, no inaccessible content,
  normal page scrolling, map/list + nav + filters + favourites + error
  states all usable.
- **Contrast:** interactive/link text meets WCAG 2.1 AA (`--color-accent`
  is `#a85a17`, ≥4.5:1 on both `--color-bg` and `--color-surface`). Verified
  by `axe-core` across the 9-state H08 baseline; the current suite scans 10
  states after adding a distinct permission-denied location state.
- **Target size:** the "Open now only" checkbox is 1.5 rem (24 px), meeting
  the WCAG 2.2 minimum; standalone links ("Open in Google Maps", the 404
  home link) carry vertical padding for a comfortable tap target. Inline
  links inside a sentence are left at text size (WCAG 2.2 inline exception).
- **Errors:** location failures (denied, unavailable, timeout, unsupported)
  render in an assertive `role="alert"`; recoverable failures provide a clearly
  labelled **Try location again** button. Search
  progress/empty use polite `role="status"`; search failures use
  `role="alert"` with an explicit (never automatic) Retry.
- **Motion:** Bean Stalker adds no custom CSS animation/transition; card
  scroll-into-view uses the instant default. Google Maps' own pan/zoom
  animation is outside Bean Stalker's control.
- **Automated scanning:** `@axe-core/playwright` (dev-only; excluded from
  the production bundle) scans Discovery (initial / results / filtered
  -empty / empty / error), unavailable and permission-denied location states,
  Favorites (populated / empty) and 404. A clean axe run supplements — does not replace — manual
  keyboard/mobile review and is **not** a WCAG-conformance claim.

## Tone

Playful branding is acceptable; core status/error text remains clear and professional.
