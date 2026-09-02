import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { LocationSelector } from './LocationSelector.js';
import { useLocation } from './useLocation.js';

// DiscoveryPage owns the single useLocation() instance shared between
// LocationSelector and CafeMap; this harness reproduces that wiring so
// LocationSelector's own tests still exercise real hook behaviour.
function Harness() {
  const location = useLocation();
  return (
    <LocationSelector
      state={location.state}
      requestCurrentLocation={location.requestCurrentLocation}
      submitManualLocation={location.submitManualLocation}
    />
  );
}

const originalGeolocation = Object.getOwnPropertyDescriptor(globalThis.navigator, 'geolocation');

function stubGeolocation(
  getCurrentPosition: (success: PositionCallback, error?: PositionErrorCallback) => void,
) {
  Object.defineProperty(globalThis.navigator, 'geolocation', {
    value: { getCurrentPosition },
    configurable: true,
  });
}

afterEach(() => {
  if (originalGeolocation) {
    Object.defineProperty(globalThis.navigator, 'geolocation', originalGeolocation);
  } else {
    Reflect.deleteProperty(globalThis.navigator, 'geolocation');
  }
});

describe('LocationSelector', () => {
  it('resolves current location and announces it via the status region', async () => {
    stubGeolocation((success) => {
      success({ coords: { latitude: 1.5535, longitude: 110.3593 } } as GeolocationPosition);
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Use my current location' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Using your current location (1.5535, 110.3593).',
    );
  });

  it('falls back to a fully usable manual form when permission is denied', async () => {
    stubGeolocation((_success, error) => {
      error?.({ code: 1, message: 'denied' } as GeolocationPositionError);
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Use my current location' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/permission was denied/i);

    await user.type(screen.getByLabelText('Latitude'), '1.55');
    await user.type(screen.getByLabelText('Longitude'), '110.36');
    await user.click(screen.getByRole('button', { name: 'Use this location' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Using a custom location (1.5500, 110.3600).',
    );
  });

  it('accepts a manual location with a label', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText('Latitude'), '1.55');
    await user.type(screen.getByLabelText('Longitude'), '110.36');
    await user.type(screen.getByLabelText('Label (optional)'), 'Home');
    await user.click(screen.getByRole('button', { name: 'Use this location' }));

    expect(await screen.findByRole('status')).toHaveTextContent('Using Home (1.5500, 110.3600).');
  });

  it('rejects invalid manual coordinates with an accessible error alert tied to the fields', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText('Latitude'), '999');
    await user.type(screen.getByLabelText('Longitude'), '0');
    await user.click(screen.getByRole('button', { name: 'Use this location' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/enter a valid latitude/i);

    // the error is programmatically associated with both coordinate inputs
    const latitude = screen.getByLabelText('Latitude');
    const longitude = screen.getByLabelText('Longitude');
    expect(latitude).toHaveAttribute('aria-invalid', 'true');
    expect(latitude).toHaveAttribute('aria-describedby', alert.id);
    expect(longitude).toHaveAttribute('aria-describedby', alert.id);
  });

  it('disables the current-location button while resolving, without disabling the manual form', async () => {
    let resolvePosition!: () => void;
    stubGeolocation((success) => {
      resolvePosition = () =>
        success({ coords: { latitude: 1.55, longitude: 110.36 } } as GeolocationPosition);
    });
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Use my current location' }));
    expect(screen.getByRole('button', { name: 'Locating…' })).toBeDisabled();
    expect(screen.getByLabelText('Latitude')).toBeEnabled();

    resolvePosition();
    await screen.findByRole('button', { name: 'Use my current location' });
  });
});
