import type { LocationState } from './locationState.js';

export interface LocationSelectorProps {
  state: LocationState;
  requestCurrentLocation: () => Promise<void>;
}

export function LocationSelector({ state, requestCurrentLocation }: LocationSelectorProps) {
  const statusMessage =
    state.status === 'resolved'
      ? 'Location found.'
      : state.status === 'idle' || state.status === 'resolving'
        ? 'Finding your location…'
        : '';

  return (
    <div className="location-selector">
      <p className="location-privacy">
        Your location is used only to find nearby cafes and is not saved by Bean Stalker.
      </p>
      <p role="status" aria-label="Location status" className="location-status">
        {statusMessage}
      </p>
      {state.status === 'error' && (
        <div role="alert" className="location-status location-status--error">
          <p>{state.message}</p>
          {state.canRetry && (
            <button type="button" onClick={() => void requestCurrentLocation()}>
              Try location again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
