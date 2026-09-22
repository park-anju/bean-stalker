import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LocationSelector } from './LocationSelector.js';
import type { LocationState } from './locationState.js';

const requestCurrentLocation = vi.fn(async () => undefined);

function renderState(state: LocationState) {
  return render(<LocationSelector state={state} requestCurrentLocation={requestCurrentLocation} />);
}

describe('LocationSelector', () => {
  it('announces location progress and explains the privacy boundary', () => {
    renderState({ status: 'resolving', source: 'current' });
    expect(screen.getByRole('status', { name: 'Location status' })).toHaveTextContent(
      'Finding your location…',
    );
    expect(screen.getByText(/used only to find nearby cafes/i)).toBeInTheDocument();
    expect(screen.getByText(/not saved/i)).toBeInTheDocument();
  });

  it('announces success without exposing exact coordinates', () => {
    renderState({
      status: 'resolved',
      source: 'current',
      center: { latitude: 1.5535, longitude: 110.3593 },
    });
    const status = screen.getByRole('status', { name: 'Location status' });
    expect(status).toHaveTextContent('Location found.');
    expect(status).not.toHaveTextContent('1.5535');
    expect(status).not.toHaveTextContent('110.3593');
  });

  it('shows denied guidance and an explicit accessible retry action', async () => {
    requestCurrentLocation.mockClear();
    const user = userEvent.setup();
    renderState({
      status: 'error',
      source: 'current',
      reason: 'LOCATION_PERMISSION_DENIED',
      kind: 'permission-denied',
      message:
        "Location access is blocked for this site. Change this site's Location permission in your browser settings, then choose Try location again. Bean Stalker cannot change this setting for you.",
      canRetry: true,
    });

    expect(screen.getByRole('alert')).toHaveTextContent(/browser settings/i);
    await user.click(screen.getByRole('button', { name: 'Try location again' }));
    expect(requestCurrentLocation).toHaveBeenCalledTimes(1);
  });

  it('does not offer retry when geolocation is unsupported', () => {
    renderState({
      status: 'error',
      source: 'current',
      reason: 'LOCATION_UNAVAILABLE',
      kind: 'unsupported',
      message: "Location isn't available in this browser.",
      canRetry: false,
    });
    expect(screen.getByRole('alert')).toHaveTextContent(/isn't available/i);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('explains the secure-context requirement without offering a futile retry', () => {
    renderState({
      status: 'error',
      source: 'current',
      reason: 'LOCATION_UNAVAILABLE',
      kind: 'insecure-context',
      message:
        'Location requires a secure connection. Open Bean Stalker over HTTPS, or use localhost during development.',
      canRetry: false,
    });
    expect(screen.getByRole('alert')).toHaveTextContent(/HTTPS/i);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('contains no raw coordinate entry controls', () => {
    renderState({ status: 'idle' });
    expect(screen.queryByLabelText(/latitude/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/longitude/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });
});
