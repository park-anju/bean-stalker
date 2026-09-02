import { describe, expect, it, vi } from 'vitest';
import type { Cafe } from '@bean-stalker/contracts';
import { buildApp } from '../app.js';
import { FixedWindowRateLimiter } from '../rateLimiter.js';
import { InMemoryProviderUsageGuard } from '../providerUsageGuard.js';
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

const FROZEN = () => new Date('2026-03-10T00:00:00Z');

async function build(opts: { provider: CafeProvider; usageLimit?: number; rateMax?: number }) {
  const usageGuard = new InMemoryProviderUsageGuard(opts.usageLimit ?? 1000, FROZEN);
  const searchRateLimiter =
    opts.rateMax === undefined
      ? undefined
      : new FixedWindowRateLimiter({ max: opts.rateMax, windowMs: 60_000 }, () => 0);
  const app = await buildApp({
    webOrigin: 'http://localhost:5173',
    cafeProvider: opts.provider,
    usageGuard,
    searchRateLimiter,
    logger: false,
  });
  return { app, usageGuard };
}

function search(app: Awaited<ReturnType<typeof build>>['app'], body: unknown = validBody) {
  return app.inject({ method: 'POST', url: '/api/v1/cafes/search', payload: body as object });
}

describe('per-client rate limiting (H03)', () => {
  it('allows up to the limit, then returns a canonical 429 RATE_LIMITED with Retry-After', async () => {
    const searchNearby = vi.fn().mockResolvedValue([sampleCafe]);
    const { app } = await build({ provider: { searchNearby }, rateMax: 2 });

    expect((await search(app)).statusCode).toBe(200);
    expect((await search(app)).statusCode).toBe(200);

    const limited = await search(app);
    expect(limited.statusCode).toBe(429);
    expect(limited.headers['retry-after']).toBe('60');
    expect(limited.json()).toEqual({
      error: {
        code: 'RATE_LIMITED',
        message: expect.stringMatching(/too quickly/i),
        requestId: expect.any(String),
      },
    });
    expect(searchNearby).toHaveBeenCalledTimes(2);

    await app.close();
  });

  it('a rate-limited request consumes no global usage allowance', async () => {
    const searchNearby = vi.fn().mockResolvedValue([]);
    const { app, usageGuard } = await build({ provider: { searchNearby }, rateMax: 1 });

    await search(app);
    await search(app); // 429 — must not consume

    expect((await usageGuard.getStatus()).used).toBe(1);
    await app.close();
  });

  it('does not rate-limit /health', async () => {
    const { app } = await build({ provider: { searchNearby: vi.fn() }, rateMax: 1 });
    await search(app);
    await search(app);
    for (let i = 0; i < 5; i += 1) {
      expect((await app.inject({ method: 'GET', url: '/health' })).statusCode).toBe(200);
    }
    await app.close();
  });
});

describe('global usage guard (H04) via the route', () => {
  it('caps aggregate provider attempts and returns 503 PROVIDER_CAPACITY_EXHAUSTED beyond the limit', async () => {
    const searchNearby = vi.fn().mockResolvedValue([sampleCafe]);
    const { app } = await build({ provider: { searchNearby }, usageLimit: 3 });

    for (let i = 0; i < 3; i += 1) expect((await search(app)).statusCode).toBe(200);

    const exhausted = await search(app);
    expect(exhausted.statusCode).toBe(503);
    expect(exhausted.json().error.code).toBe('PROVIDER_CAPACITY_EXHAUSTED');
    expect(searchNearby).toHaveBeenCalledTimes(3);

    await app.close();
  });

  it('a failed provider attempt still consumes its allowance unit', async () => {
    const searchNearby = vi
      .fn()
      .mockRejectedValue(new ProviderError('PROVIDER_UNAVAILABLE', 'down'));
    const { app } = await build({ provider: { searchNearby }, usageLimit: 2 });

    expect((await search(app)).statusCode).toBe(503);
    expect((await search(app)).statusCode).toBe(503);
    const third = await search(app);
    expect(third.json().error.code).toBe('PROVIDER_CAPACITY_EXHAUSTED');
    expect(searchNearby).toHaveBeenCalledTimes(2);

    await app.close();
  });

  it('an invalid request consumes no allowance and never calls the provider', async () => {
    const searchNearby = vi.fn();
    const { app, usageGuard } = await build({ provider: { searchNearby }, usageLimit: 5 });

    const bad = await search(app, { ...validBody, radiusMeters: 999_999 });
    expect(bad.statusCode).toBe(400);
    expect(searchNearby).not.toHaveBeenCalled();
    expect((await usageGuard.getStatus()).used).toBe(0);

    await app.close();
  });
});

describe('graceful capacity exhaustion (H05)', () => {
  it('distinguishes 429 RATE_LIMITED (client) from 503 PROVIDER_CAPACITY_EXHAUSTED (global)', async () => {
    const searchNearby = vi.fn().mockResolvedValue([]);
    const { app } = await build({ provider: { searchNearby }, rateMax: 5, usageLimit: 1 });

    expect((await search(app)).statusCode).toBe(200);

    const capacity = await search(app);
    expect(capacity.statusCode).toBe(503);
    expect(capacity.json().error.code).toBe('PROVIDER_CAPACITY_EXHAUSTED');

    await app.close();
  });

  it('an ordinary search is unaffected by generous limits', async () => {
    const searchNearby = vi.fn().mockResolvedValue([sampleCafe]);
    const { app } = await build({ provider: { searchNearby }, rateMax: 10, usageLimit: 700 });

    const ok = await search(app);
    expect(ok.statusCode).toBe(200);
    expect(ok.json().cafes).toEqual([sampleCafe]);

    await app.close();
  });
});
