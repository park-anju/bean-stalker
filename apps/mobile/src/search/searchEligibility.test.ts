import { describe, expect, it } from 'vitest';

import { readySearchCenter } from './searchEligibility';

describe('readySearchCenter', () => {
  it('allows only a fresh ready location', () => {
    expect(readySearchCenter({ status: 'ready', location: { latitude: 1, longitude: 2 } })).toEqual({
      latitude: 1,
      longitude: 2,
    });
  });

  it.each([
    { status: 'idle', location: null },
    { status: 'resolving', location: { latitude: 1, longitude: 2 } },
    { status: 'services-disabled', location: { latitude: 1, longitude: 2 } },
    { status: 'permission-denied', location: null },
    { status: 'settings-required', location: null },
    { status: 'services-unavailable', location: null },
    { status: 'error', location: null },
  ] as const)('blocks $status', (state) => {
    expect(readySearchCenter(state)).toBeUndefined();
  });
});
