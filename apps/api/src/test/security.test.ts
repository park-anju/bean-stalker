import { describe, expect, it, vi } from 'vitest';
import type { Cafe } from '@bean-stalker/contracts';
import { buildApp } from '../app.js';
import { InMemoryProviderUsageGuard } from '../providerUsageGuard.js';
import { ProviderError } from '../providers/providerError.js';
import type { CafeProvider } from '../providers/cafeProvider.js';

const WEB_ORIGIN = 'http://localhost:5173';

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

async function build(provider: CafeProvider = { searchNearby: vi.fn().mockResolvedValue([]) }) {
  const usageGuard = new InMemoryProviderUsageGuard(1000, () => new Date('2026-03-10T00:00:00Z'));
  const app = await buildApp({
    webOrigin: WEB_ORIGIN,
    cafeProvider: provider,
    usageGuard,
    logger: false,
  });
  return { app, usageGuard };
}

describe('CORS (H07)', () => {
  it('grants CORS to the configured origin and never reflects an arbitrary origin', async () => {
    const { app } = await build();

    const allowed = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      payload: validBody,
      headers: { origin: WEB_ORIGIN },
    });
    expect(allowed.headers['access-control-allow-origin']).toBe(WEB_ORIGIN);

    const evil = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      payload: validBody,
      headers: { origin: 'http://evil.example' },
    });
    expect(evil.headers['access-control-allow-origin']).not.toBe('http://evil.example');

    // no Origin header (server-to-server) still works
    const noOrigin = await app.inject({ method: 'GET', url: '/health' });
    expect(noOrigin.statusCode).toBe(200);

    await app.close();
  });
});

describe('security response headers (H07)', () => {
  it('sets nosniff / no-referrer / frame-deny on every response, including errors', async () => {
    const { app } = await build();
    for (const res of [
      await app.inject({ method: 'GET', url: '/health' }),
      await app.inject({ method: 'POST', url: '/api/v1/cafes/search', payload: validBody }),
      await app.inject({ method: 'GET', url: '/does-not-exist' }),
    ]) {
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['referrer-policy']).toBe('no-referrer');
      expect(res.headers['x-frame-options']).toBe('DENY');
    }
    await app.close();
  });
});

describe('request body limit (H07)', () => {
  it('rejects an oversized body before the provider or usage guard is touched', async () => {
    const searchNearby = vi.fn();
    const { app, usageGuard } = await build({ searchNearby });

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({ ...validBody, pad: 'x'.repeat(64 * 1024) }),
    });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.statusCode).toBeLessThan(500);
    expect(res.json().error.code).toBe('VALIDATION_ERROR');
    expect(JSON.stringify(res.json())).not.toMatch(/bodyLimit|16384|too large/i);
    expect(searchNearby).not.toHaveBeenCalled();
    expect((await usageGuard.getStatus()).used).toBe(0);

    await app.close();
  });
});

describe('surface area (H07)', () => {
  it('returns the canonical NOT_FOUND envelope for an unknown route (no route pattern leaked)', async () => {
    const { app } = await build();
    const res = await app.inject({ method: 'GET', url: '/api/v1/secret-admin' });
    expect(res.statusCode).toBe(404);
    expect(res.json()).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
        requestId: expect.any(String),
      },
    });
    expect(res.body).not.toContain('secret-admin');
    await app.close();
  });

  it('does not invoke business logic for an unsupported method on a known path', async () => {
    const searchNearby = vi.fn();
    const { app } = await build({ searchNearby });
    const res = await app.inject({
      method: 'PUT',
      url: '/api/v1/cafes/search',
      payload: validBody,
    });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe('NOT_FOUND');
    expect(searchNearby).not.toHaveBeenCalled();
    await app.close();
  });
});

describe('error sanitisation (H07)', () => {
  it('an unexpected error exposes no filesystem path or internal detail to the client', async () => {
    const leaky = new Error(
      'ENOENT: /home/user/private/project/secret.ts — SECRET_INTERNAL_DETAIL_123',
    );
    const { app } = await build({ searchNearby: vi.fn().mockRejectedValue(leaky) });

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      payload: validBody,
    });
    expect(res.statusCode).toBe(500);
    expect(res.json()).toEqual({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
        requestId: expect.any(String),
      },
    });
    const body = res.body;
    expect(body).not.toContain('SECRET_INTERNAL_DETAIL_123');
    expect(body).not.toContain('/home/user/private');

    await app.close();
  });

  it('a provider timeout maps to a bounded 503 envelope, not a raw error', async () => {
    const { app } = await build({
      searchNearby: vi
        .fn()
        .mockRejectedValue(
          new ProviderError('PROVIDER_UNAVAILABLE', 'The cafe search provider timed out.'),
        ),
    });
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      payload: validBody,
    });
    expect(res.statusCode).toBe(503);
    expect(res.json().error.code).toBe('PROVIDER_UNAVAILABLE');
    await app.close();
  });
});

describe('health endpoint (H07)', () => {
  it('exposes only { status: "ok" } — no env, keys, counters or internal info', async () => {
    const { app } = await build({ searchNearby: vi.fn().mockResolvedValue([sampleCafe]) });
    const res = await app.inject({ method: 'GET', url: '/health' });
    expect(res.json()).toEqual({ status: 'ok' });
    expect(res.body).not.toMatch(/KEY|SECRET|limit|period|used|PROVIDER_MONTHLY|3001|localhost/i);
    await app.close();
  });
});
