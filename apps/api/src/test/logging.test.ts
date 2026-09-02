import { describe, expect, it, vi } from 'vitest';
import { buildApp } from '../app.js';
import { buildLoggerOptions } from '../logging.js';
import { ProviderError } from '../providers/providerError.js';
import type { CafeProvider } from '../providers/cafeProvider.js';

const CONSPICUOUS_LAT = 1.234567;
const CONSPICUOUS_LNG = 110.987654;

const validBody = {
  center: { latitude: CONSPICUOUS_LAT, longitude: CONSPICUOUS_LNG },
  radiusMeters: 2000,
  maxResults: 10,
  rankPreference: 'DISTANCE',
};

/** Builds an app whose every emitted log line is captured as a parsed object. */
async function buildAppWithCapturedLogs(provider: CafeProvider) {
  const lines: unknown[] = [];
  const stream = {
    write(chunk: string) {
      for (const line of chunk.split('\n')) {
        if (line.trim()) lines.push(JSON.parse(line));
      }
    },
  };
  const app = await buildApp({
    webOrigin: 'http://localhost:5173',
    cafeProvider: provider,
    logger: { ...buildLoggerOptions('trace'), stream },
  });
  return { app, logText: () => JSON.stringify(lines) };
}

describe('privacy-safe logging (H02)', () => {
  it('never emits precise search coordinates, the request body, or the client IP', async () => {
    const searchNearby = vi.fn().mockResolvedValue([]);
    const { app, logText } = await buildAppWithCapturedLogs({ searchNearby });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      payload: validBody,
      remoteAddress: '203.0.113.42',
    });
    expect(response.statusCode).toBe(200);

    const logs = logText();
    expect(logs).not.toContain(String(CONSPICUOUS_LAT));
    expect(logs).not.toContain(String(CONSPICUOUS_LNG));
    expect(logs).not.toContain('203.0.113.42');
    expect(logs).not.toContain('remoteAddress');
    expect(logs).not.toContain('"latitude"');

    // ...but observability is retained.
    expect(logs).toContain('/api/v1/cafes/search');
    expect(logs).toContain('"method":"POST"');
    expect(logs).toContain('"statusCode":200');

    await app.close();
  });

  it('logs only the bounded provider error code, not a raw provider message or payload', async () => {
    const searchNearby = vi
      .fn()
      .mockRejectedValue(
        new ProviderError('PROVIDER_BAD_RESPONSE', 'Google returned an unexpected response shape.'),
      );
    const { app, logText } = await buildAppWithCapturedLogs({ searchNearby });

    await app.inject({ method: 'POST', url: '/api/v1/cafes/search', payload: validBody });

    const logs = logText();
    expect(logs).toContain('PROVIDER_BAD_RESPONSE');
    expect(logs).toContain('cafe search provider failure');

    await app.close();
  });

  it('drops attached error properties (a raw provider payload cannot ride along a thrown error)', async () => {
    const leaky = Object.assign(new Error('unexpected boom'), {
      rawProviderResponse: 'SENTINEL_RAW_PROVIDER_BODY_MUST_NOT_APPEAR',
      apiKey: 'SENTINEL_FAKE_KEY_MUST_NOT_APPEAR',
    });
    const searchNearby = vi.fn().mockRejectedValue(leaky);
    const { app, logText } = await buildAppWithCapturedLogs({ searchNearby });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/cafes/search',
      payload: validBody,
    });
    expect(response.statusCode).toBe(500);

    const logs = logText();
    expect(logs).not.toContain('SENTINEL_RAW_PROVIDER_BODY_MUST_NOT_APPEAR');
    expect(logs).not.toContain('SENTINEL_FAKE_KEY_MUST_NOT_APPEAR');
    // the bounded parts are still there for debugging
    expect(logs).toContain('unhandled error');

    // and never in the client response
    expect(JSON.stringify(response.json())).not.toContain('SENTINEL');

    await app.close();
  });

  it('redacts credential-shaped fields passed to a manual log call', async () => {
    const searchNearby = vi.fn().mockResolvedValue([]);
    const { app, logText } = await buildAppWithCapturedLogs({ searchNearby });

    app.log.info(
      { apiKey: 'THIS_MUST_NEVER_APPEAR_IN_LOGS', body: { center: { latitude: 9.9 } } },
      'manual log with sensitive fields',
    );

    const logs = logText();
    expect(logs).not.toContain('THIS_MUST_NEVER_APPEAR_IN_LOGS');
    expect(logs).not.toContain('9.9');
    expect(logs).toContain('manual log with sensitive fields');

    await app.close();
  });
});
