---
id: IFACE-UX-CONTRACT
type: interface-spec
status: approved
version: 1.1
authority: canonical
owner: Project Owner
updated: 2026-09-03
---
# UX Contract

## Core principle

The list is the accessible information surface; the map is a spatial enhancement, not the only way to use Bean Stalker.

## Discovery states

### Initial
Explain what to do and present current/manual location options.

### Locating
Show location progress and a manual alternative if resolution is slow/fails.

### Searching
Keep layout stable; show clear progress; do not duplicate requests on incidental rerenders.

### Results
List and map represent the same current result set. Card/marker selection is synchronized.

### Empty
State that no matching cafes were returned for the current area/filters; offer radius/filter adjustment.

### Error
Explain that search failed without pretending there are zero cafes. Offer retry/manual location as relevant.

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
  by `axe-core` across 9 representative states.
- **Target size:** the "Open now only" checkbox is 1.5 rem (24 px), meeting
  the WCAG 2.2 minimum; standalone links ("Open in Google Maps", the 404
  home link) carry vertical padding for a comfortable tap target. Inline
  links inside a sentence are left at text size (WCAG 2.2 inline exception).
- **Errors:** location failures (denied permission, invalid coordinates)
  render in an assertive `role="alert"`; invalid manual coordinates set
  `aria-invalid` + `aria-describedby` on both coordinate inputs. Search
  progress/empty use polite `role="status"`; search failures use
  `role="alert"` with an explicit (never automatic) Retry.
- **Motion:** Bean Stalker adds no custom CSS animation/transition; card
  scroll-into-view uses the instant default. Google Maps' own pan/zoom
  animation is outside Bean Stalker's control.
- **Automated scanning:** `@axe-core/playwright` (dev-only; excluded from
  the production bundle) scans Discovery (initial / results / filtered
  -empty / empty / error), the location-error state, Favorites (populated /
  empty) and 404. A clean axe run supplements — does not replace — manual
  keyboard/mobile review and is **not** a WCAG-conformance claim.

## Tone

Playful branding is acceptable; core status/error text remains clear and professional.
