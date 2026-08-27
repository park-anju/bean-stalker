import { useCallback, useReducer } from 'react';
import { SearchCenterSchema } from '@bean-stalker/contracts';
import { initialLocationState, locationReducer, type LocationState } from './locationState.js';
import { mapGeolocationError } from './geolocationErrors.js';
import {
  browserGeolocationAdapter,
  isGeolocationSupported,
  type GeolocationAdapter,
} from './browserGeolocation.js';

export interface ManualLocationInput {
  latitude: number;
  longitude: number;
  label?: string;
}

export interface UseLocationResult {
  state: LocationState;
  requestCurrentLocation: () => Promise<void>;
  submitManualLocation: (input: ManualLocationInput) => void;
  reset: () => void;
}

export function useLocation(
  adapter: GeolocationAdapter = browserGeolocationAdapter,
): UseLocationResult {
  const [state, dispatch] = useReducer(locationReducer, initialLocationState);

  const requestCurrentLocation = useCallback(async () => {
    if (!isGeolocationSupported()) {
      dispatch({
        type: 'FAILED',
        source: 'current',
        reason: 'LOCATION_UNAVAILABLE',
        message:
          'This browser does not support location services. Enter a location manually below.',
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
      const { reason, message } = mapGeolocationError(error as { code: number });
      dispatch({ type: 'FAILED', source: 'current', reason, message });
    }
  }, [adapter]);

  const submitManualLocation = useCallback((input: ManualLocationInput) => {
    dispatch({ type: 'REQUEST_MANUAL' });
    const result = SearchCenterSchema.safeParse(input);
    if (!result.success) {
      dispatch({
        type: 'FAILED',
        source: 'manual',
        reason: 'VALIDATION_ERROR',
        message: 'Enter a valid latitude (-90 to 90) and longitude (-180 to 180).',
      });
      return;
    }
    dispatch({ type: 'RESOLVED', source: 'manual', center: result.data });
  }, []);

  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return { state, requestCurrentLocation, submitManualLocation, reset };
}
