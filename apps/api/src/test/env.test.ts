import { describe, expect, it } from 'vitest';
import { loadServerEnv } from '../env.js';

const liveEnv = {
  PORT: '3001',
  WEB_ORIGIN: 'http://localhost:5173',
  GOOGLE_PLACES_SERVER_KEY: 'test-server-key',
  GOOGLE_PLACES_TIMEOUT_MS: '5000',
  PROVIDER_MONTHLY_REQUEST_LIMIT: '700',
};

const fixtureEnv = { PORT: '3001', WEB_ORIGIN: 'http://localhost:5173', CAFE_PROVIDER: 'fixture' };

describe('loadServerEnv — live mode', () => {
  it('accepts a fully populated environment with defaulted operational config', () => {
    expect(loadServerEnv(liveEnv)).toEqual({
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

  it('defaults CAFE_PROVIDER to live', () => {
    expect(loadServerEnv(liveEnv).cafeProvider).toBe('live');
  });

  it('FAILS CLOSED without the server key or without the monthly limit', () => {
    const { GOOGLE_PLACES_SERVER_KEY: _k, ...noKey } = liveEnv;
    const { PROVIDER_MONTHLY_REQUEST_LIMIT: _l, ...noLimit } = liveEnv;
    expect(() => loadServerEnv(noKey)).toThrowError(/GOOGLE_PLACES_SERVER_KEY/);
    expect(() => loadServerEnv(noLimit)).toThrowError(/PROVIDER_MONTHLY_REQUEST_LIMIT/);
  });

  it('accepts 0 as a deliberate monthly limit and rejects a negative one', () => {
    expect(
      loadServerEnv({ ...liveEnv, PROVIDER_MONTHLY_REQUEST_LIMIT: '0' })
        .providerMonthlyRequestLimit,
    ).toBe(0);
    expect(() => loadServerEnv({ ...liveEnv, PROVIDER_MONTHLY_REQUEST_LIMIT: '-5' })).toThrowError(
      /PROVIDER_MONTHLY_REQUEST_LIMIT/,
    );
  });
});

describe('loadServerEnv — fixture mode', () => {
  it('starts with no Google credential, no monthly limit, and defaulted timeout', () => {
    const env = loadServerEnv(fixtureEnv);
    expect(env.cafeProvider).toBe('fixture');
    expect(env.googlePlacesServerKey).toBeUndefined();
    expect(env.providerMonthlyRequestLimit).toBeUndefined();
    expect(env.googlePlacesTimeoutMs).toBe(10_000);
  });
});

describe('loadServerEnv — validation', () => {
  it('rejects an unknown CAFE_PROVIDER value', () => {
    expect(() => loadServerEnv({ ...liveEnv, CAFE_PROVIDER: 'google' })).toThrowError(
      /CAFE_PROVIDER/,
    );
  });

  it('rejects an absurd or negative provider timeout, keeps a sane one', () => {
    expect(
      loadServerEnv({ ...liveEnv, GOOGLE_PLACES_TIMEOUT_MS: '8000' }).googlePlacesTimeoutMs,
    ).toBe(8000);
    expect(() => loadServerEnv({ ...liveEnv, GOOGLE_PLACES_TIMEOUT_MS: '600000' })).toThrowError(
      /GOOGLE_PLACES_TIMEOUT_MS/,
    );
    expect(() => loadServerEnv({ ...liveEnv, GOOGLE_PLACES_TIMEOUT_MS: '-1' })).toThrowError(
      /GOOGLE_PLACES_TIMEOUT_MS/,
    );
  });

  it('rejects a non-integer LOG_LEVEL / rate-limit value', () => {
    expect(() => loadServerEnv({ ...liveEnv, LOG_LEVEL: 'chatty' })).toThrowError(/LOG_LEVEL/);
    expect(() => loadServerEnv({ ...liveEnv, SEARCH_RATE_LIMIT_MAX: '0' })).toThrowError(
      /SEARCH_RATE_LIMIT_MAX/,
    );
  });

  it('rejects a WEB_ORIGIN that is not a bare origin', () => {
    for (const bad of ['not-a-url', 'localhost:5173', 'ftp://x', 'http://x/api', 'http://x?a=1']) {
      expect(() => loadServerEnv({ ...liveEnv, WEB_ORIGIN: bad })).toThrowError(/WEB_ORIGIN/);
    }
    // a trailing slash is tolerated and normalised away
    expect(loadServerEnv({ ...liveEnv, WEB_ORIGIN: 'http://localhost:5173/' }).webOrigin).toBe(
      'http://localhost:5173',
    );
  });

  it('fails fast on a non-numeric PORT', () => {
    expect(() => loadServerEnv({ ...liveEnv, PORT: 'not-a-port' })).toThrowError(/PORT/);
  });

  it('never echoes an offending value (a bad secret) in the error message', () => {
    const secret = 'AIzaSy-super-secret-should-never-appear-in-errors';
    try {
      // an unrelated field is invalid, so validation throws while the secret is present
      loadServerEnv({ ...liveEnv, GOOGLE_PLACES_SERVER_KEY: secret, PORT: 'nope' });
      throw new Error('expected loadServerEnv to throw');
    } catch (error) {
      expect((error as Error).message).not.toContain(secret);
      expect((error as Error).message).toMatch(/PORT/);
    }
  });
});
