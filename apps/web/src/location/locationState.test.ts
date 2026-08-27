import { describe, expect, it } from 'vitest';
import { initialLocationState, locationReducer } from './locationState.js';
import type { LocationState } from './locationState.js';

const kuchingCenter = { latitude: 1.5535, longitude: 110.3593 };

describe('locationReducer', () => {
  it('starts idle', () => {
    expect(initialLocationState).toEqual({ status: 'idle' });
  });

  it('transitions idle -> resolving on REQUEST_CURRENT, tagged with its source', () => {
    const next = locationReducer(initialLocationState, { type: 'REQUEST_CURRENT' });
    expect(next).toEqual({ status: 'resolving', source: 'current' });
  });

  it('transitions resolving -> resolved on RESOLVED', () => {
    const resolving: LocationState = { status: 'resolving', source: 'current' };
    const next = locationReducer(resolving, {
      type: 'RESOLVED',
      source: 'current',
      center: kuchingCenter,
    });
    expect(next).toEqual({ status: 'resolved', source: 'current', center: kuchingCenter });
  });

  it('transitions resolving -> error on FAILED, preserving the reason and a human message', () => {
    const resolving: LocationState = { status: 'resolving', source: 'current' };
    const next = locationReducer(resolving, {
      type: 'FAILED',
      source: 'current',
      reason: 'LOCATION_PERMISSION_DENIED',
      message: 'Location permission was denied.',
    });
    expect(next).toEqual({
      status: 'error',
      source: 'current',
      reason: 'LOCATION_PERMISSION_DENIED',
      message: 'Location permission was denied.',
    });
  });

  it('lets a manual submission replace a failed current-location attempt (current failure never blocks manual)', () => {
    const failedCurrent: LocationState = {
      status: 'error',
      source: 'current',
      reason: 'LOCATION_PERMISSION_DENIED',
      message: 'Location permission was denied.',
    };
    const next = locationReducer(failedCurrent, {
      type: 'RESOLVED',
      source: 'manual',
      center: { ...kuchingCenter, label: 'Home' },
    });
    expect(next).toEqual({
      status: 'resolved',
      source: 'manual',
      center: { ...kuchingCenter, label: 'Home' },
    });
  });

  it('lets a fresh current-location request replace an already-resolved manual origin, not merge with it', () => {
    const resolvedManual: LocationState = {
      status: 'resolved',
      source: 'manual',
      center: { ...kuchingCenter, label: 'Home' },
    };
    const next = locationReducer(resolvedManual, { type: 'REQUEST_CURRENT' });
    expect(next).toEqual({ status: 'resolving', source: 'current' });
  });

  it('returns to idle on RESET from any state', () => {
    const resolved: LocationState = {
      status: 'resolved',
      source: 'current',
      center: kuchingCenter,
    };
    expect(locationReducer(resolved, { type: 'RESET' })).toEqual({ status: 'idle' });
  });
});
