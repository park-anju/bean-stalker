import { useEffect, useRef, useState } from 'react';
import type { Cafe, SearchCenter } from '@bean-stalker/contracts';
import { clientEnv } from '../env.js';
import { loadGoogleMaps } from './googleMapsLoader.js';
import { MarkerLayer, type MarkerLibrary } from './markerLayer.js';

export interface CafeMapProps {
  center: SearchCenter | undefined;
  cafes?: Cafe[];
  selectedCafeId?: string | null;
  onSelectCafe?: (placeId: string | null) => void;
}

type MapLifecycle = 'loading' | 'ready' | 'error';

// Cafe discovery only needs a neighborhood-scale view, not a street-level
// zoom — Location Resolution/UX Contract don't specify a value, so this is
// a documented implementation assumption.
const DEFAULT_ZOOM = 15;

const NO_CAFES: Cafe[] = [];

/**
 * Map + marker presentation. Owns exactly one `google.maps.Map` and (via
 * {@link MarkerLayer}) one marker per cafe `placeId`. It renders whatever
 * `cafes`/`selectedCafeId` it is given and reports marker clicks back through
 * `onSelectCafe` — it never fetches cafe data, calls a provider, or triggers a
 * search.
 */
export function CafeMap({
  center,
  cafes = NO_CAFES,
  selectedCafeId = null,
  onSelectCafe,
}: CafeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerLibRef = useRef<MarkerLibrary | null>(null);
  const layerRef = useRef<MarkerLayer | null>(null);
  const onSelectRef = useRef(onSelectCafe);
  const [lifecycle, setLifecycle] = useState<MapLifecycle>('loading');
  const [errorMessage, setErrorMessage] = useState('The map could not be loaded.');

  useEffect(() => {
    onSelectRef.current = onSelectCafe;
  }, [onSelectCafe]);

  // Map instance lifecycle: created once (with a Map ID, required by Advanced
  // Markers), re-centered via setCenter on later location changes.
  useEffect(() => {
    if (!center) {
      return;
    }

    let cancelled = false;

    async function initialize(resolvedCenter: SearchCenter) {
      const position: google.maps.LatLngLiteral = {
        lat: resolvedCenter.latitude,
        lng: resolvedCenter.longitude,
      };

      try {
        const existingMap = mapRef.current;
        if (existingMap) {
          existingMap.setCenter(position);
        } else {
          await loadGoogleMaps(clientEnv.googleMapsBrowserKey);
          if (cancelled) return;

          const { Map } = await google.maps.importLibrary('maps');
          if (cancelled) return;

          if (containerRef.current) {
            mapRef.current = new Map(containerRef.current, {
              center: position,
              zoom: DEFAULT_ZOOM,
              mapId: clientEnv.googleMapsMapId,
            });
          }
        }

        if (!cancelled) setLifecycle('ready');
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(error instanceof Error ? error.message : 'The map could not be loaded.');
        setLifecycle('error');
      }
    }

    void initialize(center);

    return () => {
      cancelled = true;
    };
  }, [center]);

  // Marker set reconciliation. All mutation lives inside MarkerLayer, so this
  // effect only ever calls methods.
  useEffect(() => {
    const map = mapRef.current;
    if (lifecycle !== 'ready' || !map) {
      return;
    }

    let cancelled = false;

    async function ensureLayer(readyMap: google.maps.Map): Promise<MarkerLayer | null> {
      const existingLayer = layerRef.current;
      if (existingLayer) return existingLayer;

      let lib = markerLibRef.current;
      if (!lib) {
        lib = await google.maps.importLibrary('marker');
        markerLibRef.current = lib;
      }
      if (cancelled) return null;

      const created = new MarkerLayer(readyMap, lib, (placeId) => onSelectRef.current?.(placeId));
      layerRef.current = created;
      return created;
    }

    void ensureLayer(map).then((layer) => {
      if (!cancelled) layer?.sync(cafes);
    });

    return () => {
      cancelled = true;
    };
  }, [cafes, lifecycle]);

  // Selection styling + pan. Pure map presentation — never a search.
  useEffect(() => {
    if (lifecycle !== 'ready') {
      return;
    }
    layerRef.current?.setSelected(selectedCafeId, cafes);
  }, [selectedCafeId, cafes, lifecycle]);

  // Unmount: drop every marker and listener the layer created.
  useEffect(() => {
    return () => layerRef.current?.destroy();
  }, []);

  const status = center ? lifecycle : 'no-center';

  return (
    <div className="cafe-map" role="region" aria-label="Map">
      <div ref={containerRef} className="cafe-map__surface" hidden={status !== 'ready'} />
      {status === 'no-center' && (
        <p className="cafe-map__status">Set a location above to see it on the map.</p>
      )}
      {status === 'loading' && (
        <p className="cafe-map__status" role="status" aria-label="Map status">
          Loading map…
        </p>
      )}
      {status === 'error' && (
        <p className="cafe-map__status" role="status" aria-label="Map status">
          The map is unavailable right now ({errorMessage}). The cafe list below still works.
        </p>
      )}
    </div>
  );
}
