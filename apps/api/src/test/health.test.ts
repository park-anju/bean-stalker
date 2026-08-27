import { describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import type { CafeProvider } from '../providers/cafeProvider.js';

const fakeCafeProvider: CafeProvider = {
  searchNearby: async () => [],
};

describe('GET /health', () => {
  it('returns ok status', async () => {
    const app = await buildApp({
      webOrigin: 'http://localhost:5173',
      cafeProvider: fakeCafeProvider,
    });

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });

    await app.close();
  });
});
