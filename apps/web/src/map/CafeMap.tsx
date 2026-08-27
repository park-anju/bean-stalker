import { useEffect, useRef, useState } from 'react';
import type { SearchCenter } from '@bean-stalker/contracts';
import { clientEnv } from '../env.js';
import { loadGoogleMaps } from './googleMapsLoader.js';

export interface CafeMapProps {
  center: SearchCenter | undefined;
}

type MapLifecycle = 'loading' | 'ready' | 'error';

// Cafe discovery only needs a neighborhood-scale view, not a street-level
// zoom — Location Resolution/UX Contract don't specify a value, so this is
// a documented implementation assumption.
const DEFAULT_ZOOM = 15;

export function CafeMap({ center }: CafeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [lifecycle, setLifecycle] = useState<MapLifecycle>('loading');
  const [errorMessage, setErrorMessage] = useState('The map could not be loaded.');

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
        if (mapRef.current) {
          mapRef.current.setCenter(position);
        } else {
          await loadGoogleMaps(clientEnv.googleMapsBrowserKey);
          if (cancelled) return;

          const { Map } = await google.maps.importLibrary('maps');
          if (cancelled) return;

          if (containerRef.current) {
            mapRef.current = new Map(containerRef.current, {
              center: position,
              zoom: DEFAULT_ZOOM,
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
          The map is unavailable right now ({errorMessage}). The cafe list will still work once
          search is connected.
        </p>
      )}
    </div>
  );
}
