import { useId } from 'react';
import { ManualLocationForm } from './ManualLocationForm.js';
import type { LocationState } from './locationState.js';
import type { ManualLocationInput } from './useLocation.js';

export interface LocationSelectorProps {
  state: LocationState;
  requestCurrentLocation: () => Promise<void>;
  submitManualLocation: (input: ManualLocationInput) => void;
}

function describeResolved(state: Extract<LocationState, { status: 'resolved' }>): string {
  const { source, center } = state;
  const coords = `${center.latitude.toFixed(4)}, ${center.longitude.toFixed(4)}`;
  if (source === 'current') return `Using your current location (${coords}).`;
  return center.label
    ? `Using ${center.label} (${coords}).`
    : `Using a custom location (${coords}).`;
}

export function LocationSelector({
  state,
  requestCurrentLocation,
  submitManualLocation,
}: LocationSelectorProps) {
  const isResolvingCurrent = state.status === 'resolving' && state.source === 'current';
  const errorId = useId();

  const errorMessage = state.status === 'error' ? state.message : undefined;
  // A manual-submission validation error is associated with the lat/long
  // fields; a geolocation error is not tied to any field.
  const manualErrorId = state.status === 'error' && state.source === 'manual' ? errorId : undefined;

  const statusMessage =
    state.status === 'resolved'
      ? describeResolved(state)
      : isResolvingCurrent
        ? 'Finding your current location…'
        : '';

  return (
    <div className="location-selector">
      <button
        type="button"
        onClick={() => void requestCurrentLocation()}
        disabled={isResolvingCurrent}
      >
        {isResolvingCurrent ? 'Locating…' : 'Use my current location'}
      </button>

      <ManualLocationForm
        onSubmit={submitManualLocation}
        errorMessageId={manualErrorId}
        invalid={manualErrorId !== undefined}
      />

      {/* A polite live region for progress/success; a separate assertive
          alert (mounted only on failure) so a denied-permission or invalid
          -coordinates message interrupts rather than being missed. */}
      <p role="status" aria-label="Location status" className="location-status">
        {statusMessage}
      </p>
      {errorMessage !== undefined && (
        <p id={errorId} role="alert" className="location-status location-status--error">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
