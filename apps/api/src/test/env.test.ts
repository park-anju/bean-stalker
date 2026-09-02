import { describe, expect, it } from 'vitest';
import { loadServerEnv } from '../env.js';

const validEnv = {
  PORT: '3001',
  WEB_ORIGIN: 'http://localhost:5173',
  GOOGLE_PLACES_SERVER_KEY: 'test-server-key',
  GOOGLE_PLACES_TIMEOUT_MS: '5000',
  // live mode requires an explicit global usage-guard limit (H04)
  PROVIDER_MONTHLY_REQUEST_LIMIT: '700',
};

describe('loadServerEnv', () => {
  it('accepts a fully populated, well-formed environment with defaulted operational config', () => {
    const env = loadServerEnv(validEnv);
    expect(env).toEqual({
      port: 3001,
      webOrigin: 'http://localhost:5173',
      googlePlacesServerKey: 'test-server-key',
      googlePlacesTimeoutMs: 5000,
      cafeProvider: 'live',
      logLevel: 'info',
      searchRateLimitMax: 10,
      searchRateLimitWindowMs: 60_000,
      providerMonthlyRequestLimit: 700,
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

  it('requires PROVIDER_MONTHLY_REQUEST_LIMIT when CAFE_PROVIDER=live', () => {
    const { PROVIDER_MONTHLY_REQUEST_LIMIT: _omitted, ...withoutLimit } = validEnv;
    expect(() => loadServerEnv(withoutLimit)).toThrowError(/PROVIDER_MONTHLY_REQUEST_LIMIT/);
  });

  it('does not require PROVIDER_MONTHLY_REQUEST_LIMIT in fixture mode', () => {
    const { PROVIDER_MONTHLY_REQUEST_LIMIT: _omitted, ...withoutLimit } = validEnv;
    const env = loadServerEnv({ ...withoutLimit, CAFE_PROVIDER: 'fixture' });
    expect(env.providerMonthlyRequestLimit).toBeUndefined();
  });

  it('accepts 0 as a deliberate PROVIDER_MONTHLY_REQUEST_LIMIT and rejects a negative one', () => {
    expect(
      loadServerEnv({ ...validEnv, PROVIDER_MONTHLY_REQUEST_LIMIT: '0' })
        .providerMonthlyRequestLimit,
    ).toBe(0);
    expect(() => loadServerEnv({ ...validEnv, PROVIDER_MONTHLY_REQUEST_LIMIT: '-5' })).toThrowError(
      /PROVIDER_MONTHLY_REQUEST_LIMIT/,
    );
  });

  it('rejects a non-integer LOG_LEVEL / rate-limit value', () => {
    expect(() => loadServerEnv({ ...validEnv, LOG_LEVEL: 'chatty' })).toThrowError(/LOG_LEVEL/);
    expect(() => loadServerEnv({ ...validEnv, SEARCH_RATE_LIMIT_MAX: '0' })).toThrowError(
      /SEARCH_RATE_LIMIT_MAX/,
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
