---
id: IFACE-USER-GUIDE
type: interface-spec
status: approved
version: 1.0
authority: derived
owner: Project Owner
updated: 2026-08-27
---
# Bean Stalker User Guide

## Find cafes near you

1. Open Bean Stalker.
2. Choose **Use my location** or select a location manually.
3. Adjust search radius/ranking if desired.
4. Run the search.
5. Compare the cafe list and map markers.

## Refine results

Use sort/filter controls to prioritize distance, rating, currently-open cafes, or favourites. `Open now` only includes cafes for which the provider returned a known open state.

## Save a cafe

Use the favourite control on a cafe card/detail. Bean Stalker stores the favourite on this browser/device only. There is no account or cloud sync in P0.

## Open in Google Maps

When a provider URI is available, use the Google Maps action to continue with directions/details in Google Maps.

## If location access is denied

Bean Stalker should remain usable. Select a location manually and search from there.

## If search fails

A provider/network failure is different from “no cafes found.” Use retry, or adjust location after the app reports the failure.

## Data caveats

Ratings, opening status, pricing and business state originate from external provider data and can change. Saved favourites may contain an older snapshot until searched/refreshed again.
