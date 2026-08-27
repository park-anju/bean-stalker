import { describe, expect, it, vi } from 'vitest';
import type { CafeSearchRequest } from '@bean-stalker/contracts';
import { GooglePlacesProvider } from './googlePlacesProvider.js';

const validRequest: CafeSearchRequest = {
  center: { latitude: 1.5535, longitude: 110.3593 },
  radiusMeters: 2000,
  maxResults: 10,
  rankPreference: 'DISTANCE',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('GooglePlacesProvider — request construction', () => {
  it('sends the correct method, URL, headers, and body', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}));
    const provider = new GooglePlacesProvider({ apiKey: 'test-key', timeoutMs: 5000, fetchImpl });

    await provider.searchNearby(validRequest);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const call = fetchImpl.mock.calls[0];
    if (!call) throw new Error('fetchImpl was not called');
    const [url, init] = call;
    expect(url).toBe('https://places.googleapis.com/v1/places:searchNearby');
    expect(init.method).toBe('POST');
    expect(init.headers['X-Goog-Api-Key']).toBe('test-key');
    expect(init.headers['X-Goog-FieldMask']).toContain('places.id');
    expect(init.headers['X-Goog-FieldMask']).not.toBe('*');

    const body = JSON.parse(init.body as string);
    expect(body.includedTypes).toEqual(['cafe']);
    expect(body.maxResultCount).toBe(10);
    expect(body.locationRestriction.circle.center).toEqual(validRequest.center);
    expect(body.locationRestriction.circle.radius).toBe(2000);
    expect(body.rankPreference).toBe('DISTANCE');
  });
});

describe('GooglePlacesProvider — successful mapping', () => {
  it('maps a well-formed Google response to Cafe[]', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        places: [
          {
            id: 'places/abc',
            displayName: { text: 'Test Cafe' },
            location: { latitude: 1.556, longitude: 110.36 },
          },
        ],
      }),
    );
    const provider = new GooglePlacesProvider({ apiKey: 'test-key', timeoutMs: 5000, fetchImpl });

    const cafes = await provider.searchNearby(validRequest);

    expect(cafes).toHaveLength(1);
    expect(cafes[0]).toMatchObject({
      placeId: 'places/abc',
      name: 'Test Cafe',
      openStatus: 'UNKNOWN',
    });
  });

  it('returns an empty array for a response with no places key, not an error', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}));
    const provider = new GooglePlacesProvider({ apiKey: 'test-key', timeoutMs: 5000, fetchImpl });
    await expect(provider.searchNearby(validRequest)).resolves.toEqual([]);
  });
});

describe('GooglePlacesProvider — error mapping', () => {
  it('maps a 401 to PROVIDER_AUTH_ERROR', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ error: { message: 'nope' } }, 401));
    const provider = new GooglePlacesProvider({ apiKey: 'bad-key', timeoutMs: 5000, fetchImpl });
    await expect(provider.searchNearby(validRequest)).rejects.toMatchObject({
      code: 'PROVIDER_AUTH_ERROR',
    });
  });

  it('maps a 403 to PROVIDER_AUTH_ERROR', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, 403));
    const provider = new GooglePlacesProvider({ apiKey: 'bad-key', timeoutMs: 5000, fetchImpl });
    await expect(provider.searchNearby(validRequest)).rejects.toMatchObject({
      code: 'PROVIDER_AUTH_ERROR',
    });
  });

  it('maps a 429 to PROVIDER_RATE_LIMITED', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, 429));
    const provider = new GooglePlacesProvider({ apiKey: 'test-key', timeoutMs: 5000, fetchImpl });
    await expect(provider.searchNearby(validRequest)).rejects.toMatchObject({
      code: 'PROVIDER_RATE_LIMITED',
    });
  });

  it('maps a 500 to PROVIDER_UNAVAILABLE', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, 500));
    const provider = new GooglePlacesProvider({ apiKey: 'test-key', timeoutMs: 5000, fetchImpl });
    await expect(provider.searchNearby(validRequest)).rejects.toMatchObject({
      code: 'PROVIDER_UNAVAILABLE',
    });
  });

  it('maps a malformed successful response (missing required place id) to PROVIDER_BAD_RESPONSE', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        places: [{ displayName: { text: 'x' }, location: { latitude: 1, longitude: 1 } }],
      }),
    );
    const provider = new GooglePlacesProvider({ apiKey: 'test-key', timeoutMs: 5000, fetchImpl });
    await expect(provider.searchNearby(validRequest)).rejects.toMatchObject({
      code: 'PROVIDER_BAD_RESPONSE',
    });
  });

  it('maps a non-JSON success body to PROVIDER_BAD_RESPONSE', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('not json', { status: 200 }));
    const provider = new GooglePlacesProvider({ apiKey: 'test-key', timeoutMs: 5000, fetchImpl });
    await expect(provider.searchNearby(validRequest)).rejects.toMatchObject({
      code: 'PROVIDER_BAD_RESPONSE',
    });
  });

  it('maps a timeout/abort to PROVIDER_UNAVAILABLE without actually waiting for a real timeout', async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValue(Object.assign(new Error('timed out'), { name: 'TimeoutError' }));
    const provider = new GooglePlacesProvider({ apiKey: 'test-key', timeoutMs: 5000, fetchImpl });
    await expect(provider.searchNearby(validRequest)).rejects.toMatchObject({
      code: 'PROVIDER_UNAVAILABLE',
    });
  });

  it('maps a generic network failure to PROVIDER_UNAVAILABLE', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    const provider = new GooglePlacesProvider({ apiKey: 'test-key', timeoutMs: 5000, fetchImpl });
    await expect(provider.searchNearby(validRequest)).rejects.toMatchObject({
      code: 'PROVIDER_UNAVAILABLE',
    });
  });

  it('never includes the API key in a thrown error message', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({}, 401));
    const provider = new GooglePlacesProvider({
      apiKey: 'super-secret-fake-key',
      timeoutMs: 5000,
      fetchImpl,
    });
    try {
      await provider.searchNearby(validRequest);
      throw new Error('expected searchNearby to throw');
    } catch (error) {
      expect((error as Error).message).not.toContain('super-secret-fake-key');
    }
  });
});
