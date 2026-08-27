import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useLocation } from './useLocation.js';
import type { GeolocationAdapter } from './browserGeolocation.js';

function fakeAdapter(
  outcome: { position: GeolocationPosition } | { error: { code: number } },
): GeolocationAdapter {
  return {
    getCurrentPosition: () =>
      'position' in outcome ? Promise.resolve(outcome.position) : Promise.reject(outcome.error),
  };
}

const fakePosition = {
  coords: { latitude: 1.5535, longitude: 110.3593 },
} as GeolocationPosition;

const originalGeolocation = Object.getOwnPropertyDescriptor(globalThis.navigator, 'geolocation');

beforeEach(() => {
  // isGeolocationSupported() checks the ambient navigator, independent of the
  // injected adapter used by these tests — stub a minimal presence so the
  // support check passes and the fake adapter path actually runs.
  Object.defineProperty(globalThis.navigator, 'geolocation', {
    value: {},
    configurable: true,
  });
});

afterEach(() => {
  if (originalGeolocation) {
    Object.defineProperty(globalThis.navigator, 'geolocation', originalGeolocation);
  } else {
    Reflect.deleteProperty(globalThis.navigator, 'geolocation');
  }
});

describe('useLocation — current location', () => {
  it('resolves successfully and normalizes the browser position into a SearchCenter', async () => {
    const { result } = renderHook(() => useLocation(fakeAdapter({ position: fakePosition })));

    await act(async () => {
      await result.current.requestCurrentLocation();
    });

    expect(result.current.state).toEqual({
      status: 'resolved',
      source: 'current',
      center: { latitude: 1.5535, longitude: 110.3593 },
    });
  });

  it('reflects a resolving state while the request is in flight', async () => {
    let resolvePosition!: (position: GeolocationPosition) => void;
    const pendingAdapter: GeolocationAdapter = {
      getCurrentPosition: () => new Promise((resolve) => (resolvePosition = resolve)),
    };
    const { result } = renderHook(() => useLocation(pendingAdapter));

    act(() => {
      void result.current.requestCurrentLocation();
    });
    expect(result.current.state).toEqual({ status: 'resolving', source: 'current' });

    await act(async () => {
      resolvePosition(fakePosition);
    });
    await waitFor(() => expect(result.current.state.status).toBe('resolved'));
  });

  it('maps a permission-denied failure without breaking the hook', async () => {
    const { result } = renderHook(() => useLocation(fakeAdapter({ error: { code: 1 } })));

    await act(async () => {
      await result.current.requestCurrentLocation();
    });

    expect(result.current.state).toMatchObject({
      status: 'error',
      source: 'current',
      reason: 'LOCATION_PERMISSION_DENIED',
    });
  });

  it('maps a position-unavailable failure to LOCATION_UNAVAILABLE', async () => {
    const { result } = renderHook(() => useLocation(fakeAdapter({ error: { code: 2 } })));

    await act(async () => {
      await result.current.requestCurrentLocation();
    });

    expect(result.current.state).toMatchObject({ status: 'error', reason: 'LOCATION_UNAVAILABLE' });
  });

  it('maps a timeout failure to LOCATION_UNAVAILABLE and allows retry afterward', async () => {
    const { result } = renderHook(() => useLocation(fakeAdapter({ error: { code: 3 } })));

    await act(async () => {
      await result.current.requestCurrentLocation();
    });
    expect(result.current.state).toMatchObject({ status: 'error', reason: 'LOCATION_UNAVAILABLE' });

    // Retrying re-enters the resolving state — a real retry action, not stuck.
    act(() => {
      void result.current.requestCurrentLocation();
    });
    expect(result.current.state).toEqual({ status: 'resolving', source: 'current' });
  });

  it('reports LOCATION_UNAVAILABLE without ever calling the adapter when geolocation is unsupported', async () => {
    Reflect.deleteProperty(globalThis.navigator, 'geolocation');
    let adapterCalled = false;
    const adapter: GeolocationAdapter = {
      getCurrentPosition: () => {
        adapterCalled = true;
        return Promise.resolve(fakePosition);
      },
    };
    const { result } = renderHook(() => useLocation(adapter));

    await act(async () => {
      await result.current.requestCurrentLocation();
    });

    expect(adapterCalled).toBe(false);
    expect(result.current.state).toMatchObject({ status: 'error', reason: 'LOCATION_UNAVAILABLE' });
  });
});

describe('useLocation — manual location', () => {
  it('accepts a valid manual location', () => {
    const { result } = renderHook(() => useLocation(fakeAdapter({ position: fakePosition })));

    act(() => {
      result.current.submitManualLocation({ latitude: 1.55, longitude: 110.36, label: 'Home' });
    });

    expect(result.current.state).toEqual({
      status: 'resolved',
      source: 'manual',
      center: { latitude: 1.55, longitude: 110.36, label: 'Home' },
    });
  });

  it('rejects invalid manual coordinates with a VALIDATION_ERROR, not a crash', () => {
    const { result } = renderHook(() => useLocation(fakeAdapter({ position: fakePosition })));

    act(() => {
      result.current.submitManualLocation({ latitude: 999, longitude: 0 });
    });

    expect(result.current.state).toMatchObject({
      status: 'error',
      source: 'manual',
      reason: 'VALIDATION_ERROR',
    });
  });

  it('lets a manual submission replace a failed current-location attempt', async () => {
    const { result } = renderHook(() => useLocation(fakeAdapter({ error: { code: 1 } })));

    await act(async () => {
      await result.current.requestCurrentLocation();
    });
    expect(result.current.state.status).toBe('error');

    act(() => {
      result.current.submitManualLocation({ latitude: 1.55, longitude: 110.36 });
    });

    expect(result.current.state).toEqual({
      status: 'resolved',
      source: 'manual',
      center: { latitude: 1.55, longitude: 110.36 },
    });
  });
});

describe('useLocation — reset', () => {
  it('returns to idle', () => {
    const { result } = renderHook(() => useLocation(fakeAdapter({ position: fakePosition })));

    act(() => {
      result.current.submitManualLocation({ latitude: 1.55, longitude: 110.36 });
    });
    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toEqual({ status: 'idle' });
  });
});
