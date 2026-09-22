import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useLocation } from './useLocation.js';
import type { GeolocationAdapter } from './browserGeolocation.js';

const fakePosition = {
  coords: { latitude: 1.5535, longitude: 110.3593 },
} as GeolocationPosition;

function makeAdapter(options?: {
  secure?: boolean;
  supported?: boolean;
  getCurrentPosition?: GeolocationAdapter['getCurrentPosition'];
}): GeolocationAdapter {
  return {
    isSecureContext: vi.fn(() => options?.secure ?? true),
    isSupported: vi.fn(() => options?.supported ?? true),
    getCurrentPosition: vi.fn(options?.getCurrentPosition ?? (() => Promise.resolve(fakePosition))),
  };
}

describe('useLocation — current location', () => {
  it('resolves successfully and normalizes the platform position into a SearchCenter', async () => {
    const adapter = makeAdapter();
    const { result } = renderHook(() => useLocation(adapter));

    await act(() => result.current.requestInitialLocation());

    expect(result.current.state).toEqual({
      status: 'resolved',
      source: 'current',
      center: { latitude: 1.5535, longitude: 110.3593 },
    });
    expect(adapter.getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('reflects a resolving state while the request is in flight', async () => {
    let resolvePosition!: (position: GeolocationPosition) => void;
    const adapter = makeAdapter({
      getCurrentPosition: () => new Promise((resolve) => (resolvePosition = resolve)),
    });
    const { result } = renderHook(() => useLocation(adapter));

    act(() => void result.current.requestInitialLocation());
    await waitFor(() =>
      expect(result.current.state).toEqual({ status: 'resolving', source: 'current' }),
    );

    await act(async () => resolvePosition(fakePosition));
    await waitFor(() => expect(result.current.state.status).toBe('resolved'));
  });

  it('treats the Geolocation API denial as authoritative and does not retry automatically', async () => {
    const adapter = makeAdapter({
      getCurrentPosition: () => Promise.reject({ code: 1 }),
    });
    const { result } = renderHook(() => useLocation(adapter));

    await act(() => result.current.requestInitialLocation());

    expect(result.current.state).toMatchObject({
      status: 'error',
      reason: 'LOCATION_PERMISSION_DENIED',
      kind: 'permission-denied',
    });
    expect(adapter.getCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it.each([
    [2, 'position-unavailable'],
    [3, 'timeout'],
    [99, 'unexpected'],
  ] as const)('maps geolocation code %s to a handled %s state', async (code, kind) => {
    const adapter = makeAdapter({
      getCurrentPosition: () => Promise.reject({ code }),
    });
    const { result } = renderHook(() => useLocation(adapter));

    await act(() => result.current.requestInitialLocation());

    expect(result.current.state).toMatchObject({
      status: 'error',
      reason: 'LOCATION_UNAVAILABLE',
      kind,
      canRetry: true,
    });
  });

  it('reports unsupported geolocation without calling the adapter and without offering futile retry', async () => {
    const adapter = makeAdapter({ supported: false });
    const { result } = renderHook(() => useLocation(adapter));

    await act(() => result.current.requestInitialLocation());

    expect(result.current.state).toMatchObject({
      status: 'error',
      kind: 'unsupported',
      canRetry: false,
    });
    expect(adapter.getCurrentPosition).not.toHaveBeenCalled();
  });

  it('reports an insecure context distinctly without attempting geolocation', async () => {
    const adapter = makeAdapter({ secure: false });
    const { result } = renderHook(() => useLocation(adapter));

    await act(() => result.current.requestInitialLocation());

    expect(result.current.state).toMatchObject({
      status: 'error',
      kind: 'insecure-context',
      canRetry: false,
    });
    expect(adapter.getCurrentPosition).not.toHaveBeenCalled();
  });

  it('deduplicates concurrent acquisition requests', async () => {
    let resolvePosition!: (position: GeolocationPosition) => void;
    const adapter = makeAdapter({
      getCurrentPosition: () => new Promise((resolve) => (resolvePosition = resolve)),
    });
    const { result } = renderHook(() => useLocation(adapter));

    act(() => {
      void result.current.requestInitialLocation();
      void result.current.requestInitialLocation();
      void result.current.requestCurrentLocation();
    });
    await waitFor(() => expect(adapter.getCurrentPosition).toHaveBeenCalledTimes(1));

    await act(async () => resolvePosition(fakePosition));
  });

  it('allows an explicit retry to succeed after the initial attempt fails', async () => {
    const getCurrentPosition = vi
      .fn<GeolocationAdapter['getCurrentPosition']>()
      .mockRejectedValueOnce({ code: 3 })
      .mockResolvedValueOnce(fakePosition);
    const adapter = makeAdapter({ getCurrentPosition });
    const { result } = renderHook(() => useLocation(adapter));

    await act(() => result.current.requestInitialLocation());
    expect(result.current.state).toMatchObject({ status: 'error', kind: 'timeout' });

    await act(() => result.current.requestCurrentLocation());
    expect(result.current.state.status).toBe('resolved');
    expect(getCurrentPosition).toHaveBeenCalledTimes(2);
  });

  it('accepts an already-available valid center without acquiring it again', () => {
    const adapter = makeAdapter();
    const center = { latitude: 1.55, longitude: 110.36 };
    const { result } = renderHook(() => useLocation(adapter, center));

    expect(result.current.state).toEqual({ status: 'resolved', source: 'current', center });
    expect(adapter.isSecureContext).not.toHaveBeenCalled();
    expect(adapter.getCurrentPosition).not.toHaveBeenCalled();
  });
});

describe('useLocation — reset', () => {
  it('returns to idle', () => {
    const { result } = renderHook(() =>
      useLocation(makeAdapter(), { latitude: 1.55, longitude: 110.36 }),
    );
    act(() => result.current.reset());
    expect(result.current.state).toEqual({ status: 'idle' });
  });
});
