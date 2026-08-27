import type { ReactNode } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
  onlineManager,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CafeSearchResponse, SearchCenter } from '@bean-stalker/contracts';
import { useCafeSearch } from './useCafeSearch.js';
import { CafeSearchError, searchCafes } from './apiClient.js';

vi.mock('./apiClient.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./apiClient.js')>();
  return { ...actual, searchCafes: vi.fn() };
});

const searchCafesMock = vi.mocked(searchCafes);

const centerA: SearchCenter = { latitude: 1.5535, longitude: 110.3593 };
const centerB: SearchCenter = { latitude: 1.6, longitude: 110.4 };

function responseFor(name: string): CafeSearchResponse {
  return {
    searchCenter: { latitude: 1.5535, longitude: 110.3593 },
    fetchedAt: '2026-08-28T02:00:00.000Z',
    cafes: [
      {
        placeId: `places/${name}`,
        name,
        location: { latitude: 1.556, longitude: 110.36 },
        openStatus: 'OPEN',
        distanceMeters: 100,
      },
    ],
  };
}

function makeWrapper() {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

beforeEach(() => {
  searchCafesMock.mockReset();
  focusManager.setFocused(true);
  onlineManager.setOnline(true);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useCafeSearch — trigger', () => {
  it('issues no request until a location is committed', async () => {
    const { wrapper } = makeWrapper();
    const { result, rerender } = renderHook(
      ({ center }: { center: SearchCenter | undefined }) => useCafeSearch(center),
      { wrapper, initialProps: { center: undefined as SearchCenter | undefined } },
    );

    expect(result.current.view.status).toBe('no-location');
    expect(searchCafesMock).not.toHaveBeenCalled();

    searchCafesMock.mockResolvedValue(responseFor('Alpha'));
    rerender({ center: centerA });

    await waitFor(() => expect(result.current.view.status).toBe('success'));
    expect(searchCafesMock).toHaveBeenCalledTimes(1);
  });

  it('issues exactly one request per committed center, and one more for a new center', async () => {
    searchCafesMock.mockResolvedValue(responseFor('Alpha'));
    const { wrapper } = makeWrapper();
    const { result, rerender } = renderHook(
      ({ center }: { center: SearchCenter | undefined }) => useCafeSearch(center),
      { wrapper, initialProps: { center: centerA } },
    );

    await waitFor(() => expect(result.current.view.status).toBe('success'));
    expect(searchCafesMock).toHaveBeenCalledTimes(1);

    // Incidental rerenders with the same center must not refetch.
    rerender({ center: centerA });
    rerender({ center: centerA });
    expect(searchCafesMock).toHaveBeenCalledTimes(1);

    searchCafesMock.mockResolvedValue(responseFor('Bravo'));
    rerender({ center: centerB });
    await waitFor(() => expect(searchCafesMock).toHaveBeenCalledTimes(2));
  });
});

describe('useCafeSearch — cost safety', () => {
  it('does not refetch on window focus or network reconnect', async () => {
    searchCafesMock.mockResolvedValue(responseFor('Alpha'));
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCafeSearch(centerA), { wrapper });

    await waitFor(() => expect(result.current.view.status).toBe('success'));
    expect(searchCafesMock).toHaveBeenCalledTimes(1);

    act(() => {
      focusManager.setFocused(false);
      focusManager.setFocused(true);
      onlineManager.setOnline(false);
      onlineManager.setOnline(true);
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(searchCafesMock).toHaveBeenCalledTimes(1);
  });

  it('reuses the cached result for the same center across a remount (no refetch on mount)', async () => {
    searchCafesMock.mockResolvedValue(responseFor('Alpha'));
    const { client } = makeWrapper();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );

    const first = renderHook(() => useCafeSearch(centerA), { wrapper });
    await waitFor(() => expect(first.result.current.view.status).toBe('success'));
    first.unmount();

    const second = renderHook(() => useCafeSearch(centerA), { wrapper });
    // Cache hit is synchronous — success without another network call.
    expect(second.result.current.view.status).toBe('success');
    expect(searchCafesMock).toHaveBeenCalledTimes(1);
  });

  it('does not retry automatically after a failure; retry() issues exactly one more request', async () => {
    searchCafesMock.mockRejectedValue(new CafeSearchError('PROVIDER_UNAVAILABLE', 'down'));
    const { wrapper } = makeWrapper();
    const { result } = renderHook(() => useCafeSearch(centerA), { wrapper });

    await waitFor(() => expect(result.current.view.status).toBe('error'));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(searchCafesMock).toHaveBeenCalledTimes(1);
    if (result.current.view.status === 'error') {
      expect(result.current.view.canRetry).toBe(true);
    }

    searchCafesMock.mockResolvedValue(responseFor('Alpha'));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.view.status).toBe('success'));
    expect(searchCafesMock).toHaveBeenCalledTimes(2);
  });
});

describe('useCafeSearch — stale-response race (TC-SEARCH-003)', () => {
  it('a late response for an older center never replaces the newer center result', async () => {
    const deferred = new Map<number, (value: CafeSearchResponse) => void>();
    searchCafesMock.mockImplementation(
      (request) =>
        new Promise<CafeSearchResponse>((resolve) => {
          deferred.set(request.center.latitude, resolve);
        }),
    );

    const { wrapper } = makeWrapper();
    const { result, rerender } = renderHook(
      ({ center }: { center: SearchCenter }) => useCafeSearch(center),
      { wrapper, initialProps: { center: centerA } },
    );

    await waitFor(() => expect(deferred.has(centerA.latitude)).toBe(true));
    expect(result.current.view.status).toBe('loading');

    // Search B starts before A resolves.
    rerender({ center: centerB });
    await waitFor(() => expect(deferred.has(centerB.latitude)).toBe(true));

    // B resolves first and is shown.
    act(() => deferred.get(centerB.latitude)?.(responseFor('Bravo')));
    await waitFor(() => {
      expect(result.current.view.status).toBe('success');
      if (result.current.view.status === 'success') {
        expect(result.current.view.cafes[0]?.name).toBe('Bravo');
      }
    });

    // A resolves late — must not overwrite B.
    act(() => deferred.get(centerA.latitude)?.(responseFor('Alpha')));
    await new Promise((resolve) => setTimeout(resolve, 20));
    if (result.current.view.status === 'success') {
      expect(result.current.view.cafes[0]?.name).toBe('Bravo');
    }
  });
});
