import { useLocation } from './useLocation.js';
import { ManualLocationForm } from './ManualLocationForm.js';
import type { LocationState } from './locationState.js';

function describeResolved(state: Extract<LocationState, { status: 'resolved' }>): string {
  const { source, center } = state;
  const coords = `${center.latitude.toFixed(4)}, ${center.longitude.toFixed(4)}`;
  if (source === 'current') return `Using your current location (${coords}).`;
  return center.label
    ? `Using ${center.label} (${coords}).`
    : `Using a custom location (${coords}).`;
}

export function LocationSelector() {
  const { state, requestCurrentLocation, submitManualLocation } = useLocation();

  const isResolvingCurrent = state.status === 'resolving' && state.source === 'current';

  return (
    <div className="location-selector">
      <button
        type="button"
        onClick={() => void requestCurrentLocation()}
        disabled={isResolvingCurrent}
      >
        {isResolvingCurrent ? 'Locating…' : 'Use my current location'}
      </button>

      <ManualLocationForm onSubmit={submitManualLocation} />

      <p role="status" className="location-status">
        {state.status === 'resolved' && describeResolved(state)}
        {state.status === 'error' && state.message}
        {isResolvingCurrent && 'Finding your current location…'}
      </p>
    </div>
  );
}
