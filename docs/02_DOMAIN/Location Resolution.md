---
id: DOMAIN-LOCATION-RESOLUTION
type: domain-spec
status: approved
version: 2.0
authority: canonical
owner: Project Owner
updated: 2026-09-19
---
# Location Resolution

## Supported origin

**Current location** — the Discover page automatically requests browser location
when no usable in-memory location is already available. The browser remains in
control of its permission prompt.

The browser adapter produces the canonical `SearchCenter { latitude, longitude,
label? }`. Raw latitude/longitude remain valid internal coordinates but are not a
normal user input.

Bean Stalker currently has no human-friendly manual place/address fallback. Adding
one requires a separately scoped provider/product decision; raw coordinate entry is
not an acceptable substitute.

## Privacy invariant

Precise user coordinates are transient search input. P0 does not persist raw current-location history to localStorage or server databases.

## Permission outcomes

- granted → Web Geolocation resolves the center and discovery continues;
- prompt/undecided → call `getCurrentPosition` once and let the browser present its
  native permission UI; remain in the locating state until success or error;
- denied → the Geolocation error moves the app to browser-settings guidance and an
  explicit retry; no automatic loop;
- unavailable → explain that device location services and browser access may need
  checking, without claiming Bean Stalker can change either, and offer explicit retry;
- timeout → explain and offer explicit retry;
- insecure context → explain that production requires HTTPS (localhost is permitted
  for development); do not mislabel it as permission denial or offer a futile retry;
- unsupported → explain that browser location is unavailable; do not offer a futile retry;
- unexpected → give bounded device/browser guidance and an explicit retry without
  exposing the browser's raw error text.

The Web Geolocation API is the authoritative acquisition path. The implementation
does not gate acquisition on `navigator.permissions`: support and behavior vary by
browser, and a permission hint must not suppress the browser's normal first-visit
flow. If the Permissions API is absent or incompatible, behavior is unchanged.

A browser with a saved denial may reject `getCurrentPosition` immediately without
showing native UI. Bean Stalker can offer **Try location again** after the user
changes site/browser settings, but cannot reopen or style the native prompt, override
a browser policy, or enable device/OS location services.

## Accuracy

Browser coordinates can be imprecise. Bean Stalker does not claim exact physical position.

## Validation

Latitude must be `[-90, 90]`; longitude `[-180, 180]`. Adapter output is validated
before it becomes a resolved center or reaches the provider flow.

See [[Privacy Boundaries]], [[Search Lifecycle]] and [[Functional Requirements]].
