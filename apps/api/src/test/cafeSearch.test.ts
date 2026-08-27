import { describe, expect, it, vi } from 'vitest';
import type { Cafe } from '@bean-stalker/contracts';
import { buildApp } from '../app.js';
import { ProviderError } from '../providers/providerError.js';
import type { CafeProvider } from '../providers/cafeProvider.js';

const validBody = {
  center: { latitude: 1.5535, longitude: 110.3593 },
  radiusMeters: 2000,
  maxResults: 10,
  rankPreference: 'DISTANCE',
};

const sampleCafe: Cafe = {
  placeId: 'places/abc',
  name: 'Test Cafe',
  location: { latitude: 1.556, longitude: 110.36 },
  openStatus: 'OPEN',
  distanceMeters: 250,
};

function buildTestApp(provider: CafeProvider) {
  return buildApp({ webOrigin: 'http://localhost:5173', cafeProvider: provider });
}

describe('POST /api/v1/cafes/search — success', () => {
  it('returns 200 with a normalized CafeSearchResponse for a valid request', async () => {
    const searchNearby = vi.fn().mockResolvedValue([sampleCafe]);
    const app = await buildTestApp({ searchNearby });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      payload: validBody,
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.searchCenter).toEqual(validBody.center);
    expect(body.cafes).toEqual([sampleCafe]);
    expect(typeof body.fetchedAt).toBe('string');
    expect(searchNearby).toHaveBeenCalledWith(validBody);

    await app.close();
  });

  it('returns 200 with an empty cafes array when the provider finds nothing — not an error', async () => {
    const searchNearby = vi.fn().mockResolvedValue([]);
    const app = await buildTestApp({ searchNearby });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      payload: validBody,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().cafes).toEqual([]);

    await app.close();
  });
});

describe('POST /api/v1/cafes/search — request validation', () => {
  it('rejects an out-of-range latitude with 400 and never calls the provider', async () => {
    const searchNearby = vi.fn();
    const app = await buildTestApp({ searchNearby });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      payload: { ...validBody, center: { latitude: 999, longitude: 0 } },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('VALIDATION_ERROR');
    expect(searchNearby).not.toHaveBeenCalled();

    await app.close();
  });

  it('rejects a radius outside the documented bound with 400 and never calls the provider', async () => {
    const searchNearby = vi.fn();
    const app = await buildTestApp({ searchNearby });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      payload: { ...validBody, radiusMeters: 50 },
    });

    expect(response.statusCode).toBe(400);
    expect(searchNearby).not.toHaveBeenCalled();

    await app.close();
  });

  it('rejects a request missing a required field with 400', async () => {
    const searchNearby = vi.fn();
    const app = await buildTestApp({ searchNearby });
    const { center: _center, ...withoutCenter } = validBody;

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      payload: withoutCenter,
    });

    expect(response.statusCode).toBe(400);
    expect(searchNearby).not.toHaveBeenCalled();

    await app.close();
  });

  it('rejects an unknown field, since the server does not accept a client-supplied provider credential', async () => {
    const searchNearby = vi.fn();
    const app = await buildTestApp({ searchNearby });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      payload: { ...validBody, apiKey: 'should-not-be-accepted' },
    });

    expect(response.statusCode).toBe(400);
    expect(searchNearby).not.toHaveBeenCalled();

    await app.close();
  });
});

describe('POST /api/v1/cafes/search — provider failures', () => {
  it('maps a provider auth failure to a stable 502 envelope without leaking provider details', async () => {
    const searchNearby = vi
      .fn()
      .mockRejectedValue(
        new ProviderError('PROVIDER_AUTH_ERROR', 'Google rejected the request credentials.'),
      );
    const app = await buildTestApp({ searchNearby });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      payload: validBody,
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toEqual({
      error: {
        code: 'PROVIDER_AUTH_ERROR',
        message: 'Google rejected the request credentials.',
        requestId: expect.any(String),
      },
    });

    await app.close();
  });

  it('maps a provider rate-limit failure to 503', async () => {
    const searchNearby = vi
      .fn()
      .mockRejectedValue(new ProviderError('PROVIDER_RATE_LIMITED', 'Rate limited.'));
    const app = await buildTestApp({ searchNearby });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      payload: validBody,
    });

    expect(response.statusCode).toBe(503);
    expect(response.json().error.code).toBe('PROVIDER_RATE_LIMITED');

    await app.close();
  });

  it('maps an unexpected non-provider error to a safe 500 INTERNAL_ERROR envelope, never the raw error message', async () => {
    const searchNearby = vi
      .fn()
      .mockRejectedValue(new Error('some internal implementation detail'));
    const app = await buildTestApp({ searchNearby });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      payload: validBody,
    });

    expect(response.statusCode).toBe(500);
    const body = response.json();
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(body)).not.toContain('some internal implementation detail');

    await app.close();
  });
});

describe('malformed request body', () => {
  it('returns the Bean Stalker error envelope, not the default Fastify shape, for unparsable JSON', async () => {
    const searchNearby = vi.fn();
    const app = await buildTestApp({ searchNearby });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      headers: { 'content-type': 'application/json' },
      payload: '{not valid json',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('VALIDATION_ERROR');
    expect(searchNearby).not.toHaveBeenCalled();

    await app.close();
  });
});
