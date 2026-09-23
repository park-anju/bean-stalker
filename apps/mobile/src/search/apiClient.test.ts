import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CafeSearchRequest } from '@bean-stalker/contracts';
import { searchCafes } from './apiClient';

const request: CafeSearchRequest = {
  center: { latitude: 1.5535, longitude: 110.3593 },
  radiusMeters: 2000,
  maxResults: 10,
  rankPreference: 'DISTANCE',
};

const responseBody = {
  searchCenter: request.center,
  fetchedAt: '2026-09-23T00:00:00.000Z',
  cafes: [
    {
      placeId: 'places/fixture',
      name: 'Fixture Coffee',
      location: { latitude: 1.55, longitude: 110.36 },
      formattedAddress: 'Fixture Street',
      openStatus: 'OPEN',
      distanceMeters: 250,
    },
  ],
};

const fetchMock = vi.fn();

beforeEach(() => vi.stubGlobal('fetch', fetchMock));
afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe('mobile search API boundary', () => {
  it('posts the shared request and validates a valid response', async () => {
    fetchMock.mockResolvedValue(jsonResponse(responseBody));
    await expect(searchCafes(request)).resolves.toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'http://127.0.0.1:3001/api/v1/cafes/search',
    );
    expect(JSON.parse(fetchMock.mock.calls[0]?.[1].body as string)).toEqual(request);
  });

  it('turns malformed 200 JSON into a bounded integrity error', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ cafes: 'not-an-array' }));
    await expect(searchCafes(request)).rejects.toMatchObject({
      code: 'PROVIDER_BAD_RESPONSE',
      name: 'CafeSearchError',
    });
  });

  it('bounds network and non-2xx failures', async () => {
    fetchMock.mockRejectedValue(new Error('socket details must not escape'));
    await expect(searchCafes(request)).rejects.toMatchObject({
      code: 'PROVIDER_UNAVAILABLE',
    });

    fetchMock.mockResolvedValue(
      jsonResponse({ error: { code: 'PROVIDER_UNAVAILABLE', message: 'server detail' } }, 503),
    );
    await expect(searchCafes(request)).rejects.toMatchObject({
      code: 'PROVIDER_UNAVAILABLE',
      name: 'CafeSearchError',
    });
  });
});
