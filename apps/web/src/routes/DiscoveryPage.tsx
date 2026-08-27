import { LocationSelector } from '../location/LocationSelector.js';
import { useLocation } from '../location/useLocation.js';
import { CafeMap } from '../map/CafeMap.js';

export function DiscoveryPage() {
  const { state, requestCurrentLocation, submitManualLocation } = useLocation();
  const resolvedCenter = state.status === 'resolved' ? state.center : undefined;

  return (
    <section className="page-intro">
      <h1>Bean Stalker</h1>
      <p>
        Discover nearby cafes from live Google Maps data — pick a location, compare results on a
        list and map, and save the ones you like.
      </p>

      <LocationSelector
        state={state}
        requestCurrentLocation={requestCurrentLocation}
        submitManualLocation={submitManualLocation}
      />

      <CafeMap center={resolvedCenter} />

      <p className="placeholder-note">
        Live cafe search and results aren&apos;t wired up yet — that&apos;s coming in a later
        milestone. You can already set a search location above.
      </p>
    </section>
  );
}
