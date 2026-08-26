---
id: IFACE-UX-CONTRACT
type: interface-spec
status: approved
version: 1.0
authority: canonical
owner: Project Owner
updated: 2026-08-27
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

## Tone

Playful branding is acceptable; core status/error text remains clear and professional.
