import { useCallback, useReducer, useRef } from 'react';
import { SearchCenterSchema, type SearchCenter } from '@bean-stalker/contracts';
import { initialLocationState, locationReducer, type LocationState } from './locationState.js';
import { mapGeolocationError } from './geolocationErrors.js';
import { browserGeolocationAdapter, type GeolocationAdapter } from './browserGeolocation.js';

export interface UseLocationResult {
  state: LocationState;
  requestInitialLocation: () => Promise<void>;
  requestCurrentLocation: () => Promise<void>;
  reset: () => void;
}

export function useLocation(
  adapter: GeolocationAdapter = browserGeolocationAdapter,
  initialCenter?: SearchCenter,
): UseLocationResult {
  const [state, dispatch] = useReducer(
    locationReducer,
    initialCenter
      ? ({ status: 'resolved', source: 'current', center: initialCenter } satisfies LocationState)
      : initialLocationState,
  );
  const requestInFlight = useRef<Promise<void> | null>(null);

  const acquireLocation = useCallback((): Promise<void> => {
    if (requestInFlight.current) return requestInFlight.current;

    const request = (async () => {
      if (!adapter.isSecureContext()) {
        dispatch({
          type: 'FAILED',
          source: 'current',
          reason: 'LOCATION_UNAVAILABLE',
          kind: 'insecure-context',
          message:
            'Location requires a secure connection. Open Bean Stalker over HTTPS, or use localhost during development.',
          canRetry: false,
        });
        return;
      }

      if (!adapter.isSupported()) {
        dispatch({
          type: 'FAILED',
          source: 'current',
          reason: 'LOCATION_UNAVAILABLE',
          kind: 'unsupported',
          message:
            "Location isn't available in this browser. Bean Stalker currently needs browser location to discover nearby cafes.",
          canRetry: false,
        });
        return;
      }

      dispatch({ type: 'REQUEST_CURRENT' });

      try {
        const position = await adapter.getCurrentPosition();
        const center = SearchCenterSchema.parse({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        dispatch({ type: 'RESOLVED', source: 'current', center });
      } catch (error) {
        const code =
          typeof error === 'object' && error !== null && 'code' in error
            ? Number(error.code)
            : Number.NaN;
        const mapped = mapGeolocationError({ code });
        dispatch({ type: 'FAILED', source: 'current', ...mapped });
      }
    })().finally(() => {
      requestInFlight.current = null;
    });

    requestInFlight.current = request;
    return request;
  }, [adapter]);

  // Both the initial request and an explicit retry use Web Geolocation as the
  // authoritative path. The Permissions API is deliberately not a gate: it is
  // not consistently available across supported browsers, and a permission
  // hint must never suppress the browser's native first-visit flow.
  const requestInitialLocation = useCallback(() => acquireLocation(), [acquireLocation]);
  const requestCurrentLocation = useCallback(() => acquireLocation(), [acquireLocation]);

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return { state, requestInitialLocation, requestCurrentLocation, reset };
}
