import { useCallback, useState } from 'react';
import type { Cafe } from '@bean-stalker/contracts';
import { LocationSelector } from '../location/LocationSelector.js';
import { useLocation } from '../location/useLocation.js';
import { CafeMap } from '../map/CafeMap.js';
import { CafeList } from '../cafes/CafeList.js';
import { SearchStatePanel } from '../cafes/SearchStatePanel.js';
import { useCafeSearch } from '../search/useCafeSearch.js';

const NO_CAFES: Cafe[] = [];

export function DiscoveryPage() {
  const { state, requestCurrentLocation, submitManualLocation } = useLocation();
  const resolvedCenter = state.status === 'resolved' ? state.center : undefined;

  // One search per committed SearchCenter. Map pan/zoom and card/marker
  // selection never reach this hook.
  const { view, retry } = useCafeSearch(resolvedCenter);
  const cafes = view.status === 'success' ? view.cafes : NO_CAFES;

  const [rawSelectedCafeId, setRawSelectedCafeId] = useState<string | null>(null);
  // Reconcile selection against the current result set by derivation, not by
  // an effect that writes state: a stale selection just reads as "none".
  const selectedCafeId =
    rawSelectedCafeId && cafes.some((cafe) => cafe.placeId === rawSelectedCafeId)
      ? rawSelectedCafeId
      : null;

  const selectCafe = useCallback((placeId: string | null) => {
    setRawSelectedCafeId(placeId);
  }, []);

  return (
    <section className="discovery">
      <div className="discovery__intro">
        <h1>Bean Stalker</h1>
        <p>
          Discover nearby cafes from live Google Maps data — pick a location, then compare results
          on the list and map and save the ones you like.
        </p>
      </div>

      <LocationSelector
        state={state}
        requestCurrentLocation={requestCurrentLocation}
        submitManualLocation={submitManualLocation}
      />

      <SearchStatePanel view={view} onRetry={retry} />

      <div className="discovery__results">
        {view.status === 'success' && !view.isEmpty && (
          <CafeList cafes={cafes} selectedCafeId={selectedCafeId} onSelectCafe={selectCafe} />
        )}
        <CafeMap
          center={resolvedCenter}
          cafes={cafes}
          selectedCafeId={selectedCafeId}
          onSelectCafe={selectCafe}
        />
      </div>
    </section>
  );
}
