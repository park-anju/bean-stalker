import { useCallback, useMemo, useState } from 'react';
import type { Cafe } from '@bean-stalker/contracts';
import { LocationSelector } from '../location/LocationSelector.js';
import { useLocation } from '../location/useLocation.js';
import { CafeMap } from '../map/CafeMap.js';
import { CafeList } from '../cafes/CafeList.js';
import { FilterBar } from '../cafes/FilterBar.js';
import { SearchStatePanel } from '../cafes/SearchStatePanel.js';
import {
  applyDiscoveryFilters,
  DEFAULT_DISCOVERY_FILTERS,
  type DiscoveryFilters,
} from '../cafes/filterState.js';
import { useCafeSearch } from '../search/useCafeSearch.js';

const NO_CAFES: Cafe[] = [];

export function DiscoveryPage() {
  const { state, requestCurrentLocation, submitManualLocation } = useLocation();
  const resolvedCenter = state.status === 'resolved' ? state.center : undefined;

  // One search per committed SearchCenter. Local filters/sort (below), map
  // pan/zoom and card/marker selection never reach this hook.
  const { view, retry } = useCafeSearch(resolvedCenter);
  const cafes = view.status === 'success' ? view.cafes : NO_CAFES;

  // Purely local UI state — never enters useCafeSearch, the TanStack Query
  // key, or the CafeSearchRequest. Changing any of it transforms the existing
  // Cafe[] and issues zero provider requests (RM0).
  const [filters, setFilters] = useState<DiscoveryFilters>(DEFAULT_DISCOVERY_FILTERS);
  const displayedCafes = useMemo(() => applyDiscoveryFilters(cafes, filters), [cafes, filters]);

  const [rawSelectedCafeId, setRawSelectedCafeId] = useState<string | null>(null);
  // Reconcile selection by derivation (not an effect that writes state): a
  // selection absent from the currently displayed set reads as "none".
  const selectedCafeId =
    rawSelectedCafeId && displayedCafes.some((cafe) => cafe.placeId === rawSelectedCafeId)
      ? rawSelectedCafeId
      : null;

  const selectCafe = useCallback((placeId: string | null) => {
    setRawSelectedCafeId(placeId);
  }, []);

  const changeFilters = useCallback(
    (next: DiscoveryFilters) => {
      setFilters(next);
      // If the change hides the selected cafe, drop the selection permanently
      // so relaxing the filter later does not silently re-select it.
      setRawSelectedCafeId((current) => {
        if (!current) return current;
        const stillVisible = applyDiscoveryFilters(cafes, next).some(
          (cafe) => cafe.placeId === current,
        );
        return stillVisible ? current : null;
      });
    },
    [cafes],
  );

  const hasResults = view.status === 'success' && cafes.length > 0;
  const filteredToEmpty = hasResults && displayedCafes.length === 0;

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

      {hasResults && <FilterBar filters={filters} onChange={changeFilters} />}

      {filteredToEmpty && (
        <p className="search-state search-state--empty" role="status">
          No cafes match your current filters. Try relaxing them.
        </p>
      )}

      <div className="discovery__results">
        {displayedCafes.length > 0 && (
          <CafeList
            cafes={displayedCafes}
            totalCount={cafes.length}
            selectedCafeId={selectedCafeId}
            onSelectCafe={selectCafe}
          />
        )}
        <CafeMap
          center={resolvedCenter}
          cafes={displayedCafes}
          selectedCafeId={selectedCafeId}
          onSelectCafe={selectCafe}
        />
      </div>
    </section>
  );
}
