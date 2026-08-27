import { describe, expect, it } from 'vitest';
import { loadServerEnv } from '../env.js';

const validEnv = {
  PORT: '3001',
  WEB_ORIGIN: 'http://localhost:5173',
  GOOGLE_PLACES_SERVER_KEY: 'test-server-key',
  GOOGLE_PLACES_TIMEOUT_MS: '5000',
};

describe('loadServerEnv', () => {
  it('accepts a fully populated, well-formed environment', () => {
    const env = loadServerEnv(validEnv);
    expect(env).toEqual({
      port: 3001,
      webOrigin: 'http://localhost:5173',
      googlePlacesServerKey: 'test-server-key',
      googlePlacesTimeoutMs: 5000,
      cafeProvider: 'live',
    });
  });

  it('defaults CAFE_PROVIDER to live and accepts an explicit fixture override', () => {
    expect(loadServerEnv(validEnv).cafeProvider).toBe('live');
    expect(loadServerEnv({ ...validEnv, CAFE_PROVIDER: 'fixture' }).cafeProvider).toBe('fixture');
  });

  it('rejects an unknown CAFE_PROVIDER value', () => {
    expect(() => loadServerEnv({ ...validEnv, CAFE_PROVIDER: 'google' })).toThrowError(
      /CAFE_PROVIDER/,
    );
  });

  it('fails fast when a required variable is missing, naming the missing field', () => {
    const { GOOGLE_PLACES_SERVER_KEY: _omitted, ...withoutServerKey } = validEnv;
    expect(() => loadServerEnv(withoutServerKey)).toThrowError(/GOOGLE_PLACES_SERVER_KEY/);
  });

  it('fails fast on a malformed WEB_ORIGIN URL', () => {
    expect(() => loadServerEnv({ ...validEnv, WEB_ORIGIN: 'not-a-url' })).toThrowError(
      /WEB_ORIGIN/,
    );
  });

  it('fails fast on a non-numeric PORT', () => {
    expect(() => loadServerEnv({ ...validEnv, PORT: 'not-a-port' })).toThrowError(/PORT/);
  });

  it('never echoes the actual server key value in a validation error message', () => {
    const secret = 'super-secret-value-should-never-appear';
    try {
      loadServerEnv({ ...validEnv, GOOGLE_PLACES_SERVER_KEY: '', WEB_ORIGIN: secret });
      throw new Error('expected loadServerEnv to throw');
    } catch (error) {
      const message = (error as Error).message;
      expect(message).not.toContain(secret);
    }
  });
});
