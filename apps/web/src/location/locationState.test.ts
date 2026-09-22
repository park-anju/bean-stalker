import { describe, expect, it } from 'vitest';
import { initialLocationState, locationReducer } from './locationState.js';
import type { LocationState } from './locationState.js';

const kuchingCenter = { latitude: 1.5535, longitude: 110.3593 };

describe('locationReducer', () => {
  it('starts idle and transitions to resolving on a current-location request', () => {
    expect(initialLocationState).toEqual({ status: 'idle' });
    expect(locationReducer(initialLocationState, { type: 'REQUEST_CURRENT' })).toEqual({
      status: 'resolving',
      source: 'current',
    });
  });

  it('transitions resolving to resolved with the validated center', () => {
    const resolving: LocationState = { status: 'resolving', source: 'current' };
    expect(
      locationReducer(resolving, {
        type: 'RESOLVED',
        source: 'current',
        center: kuchingCenter,
      }),
    ).toEqual({ status: 'resolved', source: 'current', center: kuchingCenter });
  });

  it('preserves bounded error classification and retryability', () => {
    const resolving: LocationState = { status: 'resolving', source: 'current' };
    expect(
      locationReducer(resolving, {
        type: 'FAILED',
        source: 'current',
        reason: 'LOCATION_PERMISSION_DENIED',
        kind: 'permission-denied',
        message: 'Allow location access in your browser settings.',
        canRetry: true,
      }),
    ).toEqual({
      status: 'error',
      source: 'current',
      reason: 'LOCATION_PERMISSION_DENIED',
      kind: 'permission-denied',
      message: 'Allow location access in your browser settings.',
      canRetry: true,
    });
  });

  it('returns to idle on reset', () => {
    const resolved: LocationState = {
      status: 'resolved',
      source: 'current',
      center: kuchingCenter,
    };
    expect(locationReducer(resolved, { type: 'RESET' })).toEqual({ status: 'idle' });
  });
});
