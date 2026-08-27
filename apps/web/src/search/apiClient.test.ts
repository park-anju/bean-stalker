import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CafeSearchRequest } from '@bean-stalker/contracts';
import { CafeSearchError, searchCafes } from './apiClient.js';

const request: CafeSearchRequest = {
  center: { latitude: 1.5535, longitude: 110.3593 },
  radiusMeters: 2000,
  maxResults: 10,
  rankPreference: 'DISTANCE',
};

const okResponse = {
  searchCenter: { latitude: 1.5535, longitude: 110.3593 },
  fetchedAt: '2026-08-28T02:00:00.000Z',
  cafes: [
    {
      placeId: 'places/abc',
      name: 'Test Cafe',
      location: { latitude: 1.556, longitude: 110.36 },
      openStatus: 'OPEN',
      distanceMeters: 250,
    },
  ],
};

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe('searchCafes — request shape', () => {
  it('POSTs the canonical JSON body to /api/v1/cafes/search with a JSON content type', async () => {
    fetchMock.mockResolvedValue(jsonResponse(okResponse));

    await searchCafes(request);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:3001/api/v1/cafes/search');
    expect(init.method).toBe('POST');
    expect(new Headers(init.headers).get('Content-Type')).toBe('application/json');
    expect(JSON.parse(init.body as string)).toEqual(request);
  });

  it('forwards the AbortSignal to fetch', async () => {
    fetchMock.mockResolvedValue(jsonResponse(okResponse));
    const controller = new AbortController();

    await searchCafes(request, controller.signal);

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBe(controller.signal);
  });
});

describe('searchCafes — success', () => {
  it('runtime-validates and returns a well-formed CafeSearchResponse', async () => {
    fetchMock.mockResolvedValue(jsonResponse(okResponse));
    await expect(searchCafes(request)).resolves.toEqual(okResponse);
  });

  it('accepts an empty cafes array as a successful result', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ...okResponse, cafes: [] }));
    const result = await searchCafes(request);
    expect(result.cafes).toEqual([]);
  });

  it('rejects a 200 body that does not match the response contract', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ searchCenter: {}, cafes: 'nope' }));
    await expect(searchCafes(request)).rejects.toMatchObject({
      name: 'CafeSearchError',
      code: 'PROVIDER_BAD_RESPONSE',
    });
  });
});

describe('searchCafes — errors', () => {
  it('maps a Bean Stalker error envelope to a typed CafeSearchError', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        {
          error: {
            code: 'PROVIDER_RATE_LIMITED',
            message: 'Provider quota constraint',
            requestId: 'req-9',
          },
        },
        { status: 503 },
      ),
    );

    await expect(searchCafes(request)).rejects.toMatchObject({
      code: 'PROVIDER_RATE_LIMITED',
      requestId: 'req-9',
    });
  });

  it('falls back to INTERNAL_ERROR when an error body is not a recognisable envelope', async () => {
    fetchMock.mockResolvedValue(jsonResponse('<html>502 Bad Gateway</html>', { status: 502 }));
    await expect(searchCafes(request)).rejects.toMatchObject({ code: 'INTERNAL_ERROR' });
  });

  it('maps a network failure to PROVIDER_UNAVAILABLE without leaking the raw error', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(searchCafes(request)).rejects.toMatchObject({
      name: 'CafeSearchError',
      code: 'PROVIDER_UNAVAILABLE',
    });
  });

  it('re-throws a native AbortError so a superseded search is not shown as a failure', async () => {
    fetchMock.mockRejectedValue(new DOMException('The operation was aborted.', 'AbortError'));
    await expect(searchCafes(request)).rejects.toSatisfy(
      (error: unknown) => error instanceof DOMException && error.name === 'AbortError',
    );
  });

  it('rejects an out-of-contract request before calling fetch', async () => {
    await expect(
      searchCafes({ ...request, radiusMeters: 99_999 } as CafeSearchRequest),
    ).rejects.toBeInstanceOf(Error);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

it('CafeSearchError carries a stable code and message', () => {
  const error = new CafeSearchError('PROVIDER_UNAVAILABLE', 'down');
  expect(error).toBeInstanceOf(Error);
  expect(error.code).toBe('PROVIDER_UNAVAILABLE');
});
