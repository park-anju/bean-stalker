---
id: IFACE-USER-GUIDE
type: interface-spec
status: approved
version: 1.1
authority: derived
owner: Project Owner
updated: 2026-09-19
---
# Bean Stalker User Guide

## Find cafes near you

1. Open Bean Stalker.
2. Respond to the browser's location permission request.
3. Bean Stalker finds the current location and searches automatically.
4. Compare the cafe list and map markers.

## Refine results

Use sort/filter controls to prioritize distance, rating, currently-open cafes, or favourites. `Open now` only includes cafes for which the provider returned a known open state.

## Save a cafe

Use the favourite control on a cafe card/detail. Bean Stalker stores the favourite on this browser/device only. There is no account or cloud sync in P0.

## Open in Google Maps

When a provider URI is available, use the Google Maps action to continue with directions/details in Google Maps.

## If location access is denied

Bean Stalker explains that location is needed and shows **Try location again**.
If access is blocked, allow location for the site in browser settings before retrying.
The retry asks the browser for location again; it cannot force the browser to reopen
its native permission prompt or override a saved block.
There is not yet a human-friendly manual place/address fallback.

If Bean Stalker says it could not access device location, check both device/OS
location services and whether the browser is allowed to use them. Bean Stalker
cannot enable those settings. Production sites must use HTTPS; localhost remains
supported for development.

## If search fails

A provider/network failure is different from “no cafes found.” Use retry, or adjust location after the app reports the failure.

## Data caveats

Ratings, opening status, pricing and business state originate from external provider data and can change. Saved favourites may contain an older snapshot until searched/refreshed again.
