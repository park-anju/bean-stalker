import { describe, expect, it } from 'vitest';

import { loadMobileApiConfig } from './api';

describe('mobile API configuration', () => {
  it('defaults development to the USB reverse endpoint', () => {
    expect(loadMobileApiConfig(undefined, true)).toEqual({ apiBaseUrl: 'http://127.0.0.1:3001' });
  });

  it('requires HTTPS for configured production origins', () => {
    expect(() => loadMobileApiConfig('http://127.0.0.1:3001', false)).toThrow(/HTTPS/);
    expect(loadMobileApiConfig('https://api.example.test/', false)).toEqual({
      apiBaseUrl: 'https://api.example.test',
    });
  });
});
