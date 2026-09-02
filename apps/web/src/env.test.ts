import { describe, expect, it } from 'vitest';
import { loadClientEnv } from './env';

const validEnv = {
  VITE_API_BASE_URL: 'http://localhost:3001',
  VITE_GOOGLE_MAPS_BROWSER_KEY: 'test-browser-key',
  VITE_GOOGLE_MAPS_MAP_ID: 'DEMO_MAP_ID',
};

describe('loadClientEnv', () => {
  it('accepts a fully populated, well-formed browser environment', () => {
    expect(loadClientEnv(validEnv)).toEqual({
      apiBaseUrl: 'http://localhost:3001',
      googleMapsBrowserKey: 'test-browser-key',
      googleMapsMapId: 'DEMO_MAP_ID',
    });
  });

  it('fails fast when the required Maps Map ID is missing', () => {
    const { VITE_GOOGLE_MAPS_MAP_ID: _omitted, ...withoutMapId } = validEnv;
    expect(() => loadClientEnv(withoutMapId)).toThrowError(/VITE_GOOGLE_MAPS_MAP_ID/);
  });

  it('fails fast when the required API base URL is missing', () => {
    const { VITE_API_BASE_URL: _omitted, ...withoutApiUrl } = validEnv;
    expect(() => loadClientEnv(withoutApiUrl)).toThrowError(/VITE_API_BASE_URL/);
  });

  it('fails fast on a malformed or non-origin API base URL', () => {
    for (const bad of ['not-a-url', 'localhost:3001', 'ftp://x', 'http://x/api/v1']) {
      expect(() => loadClientEnv({ ...validEnv, VITE_API_BASE_URL: bad })).toThrowError(
        /VITE_API_BASE_URL/,
      );
    }
  });

  it('normalises a trailing slash on the API base URL', () => {
    expect(
      loadClientEnv({ ...validEnv, VITE_API_BASE_URL: 'http://localhost:3001/' }).apiBaseUrl,
    ).toBe('http://localhost:3001');
  });

  it('fails fast when the required Maps browser key is missing', () => {
    const { VITE_GOOGLE_MAPS_BROWSER_KEY: _omitted, ...withoutKey } = validEnv;
    expect(() => loadClientEnv(withoutKey)).toThrowError(/VITE_GOOGLE_MAPS_BROWSER_KEY/);
  });

  it('never includes a server-only credential in the resolved browser config, even if present on the raw source object', () => {
    const env = loadClientEnv({
      ...validEnv,
      // Vite exposes only VITE_-prefixed keys to the browser at build time, but this
      // guards the parsing boundary itself in case that guarantee is ever bypassed
      // (e.g. a future refactor accidentally widening the schema).
      GOOGLE_PLACES_SERVER_KEY: 'must-never-surface-in-the-browser',
    } as Record<string, string>);
    expect(Object.values(env)).not.toContain('must-never-surface-in-the-browser');
  });
});
