import { describe, expect, it } from 'vitest';
import { mapGeolocationError } from './geolocationErrors.js';

describe('mapGeolocationError', () => {
  it('maps PERMISSION_DENIED (1) to LOCATION_PERMISSION_DENIED', () => {
    expect(mapGeolocationError({ code: 1 }).reason).toBe('LOCATION_PERMISSION_DENIED');
  });

  it('maps POSITION_UNAVAILABLE (2) to LOCATION_UNAVAILABLE', () => {
    expect(mapGeolocationError({ code: 2 }).reason).toBe('LOCATION_UNAVAILABLE');
  });

  it('maps TIMEOUT (3) to LOCATION_UNAVAILABLE, since the Error Catalog has no separate timeout code', () => {
    expect(mapGeolocationError({ code: 3 }).reason).toBe('LOCATION_UNAVAILABLE');
  });

  it('never surfaces a raw/opaque browser message as the reason', () => {
    const result = mapGeolocationError({ code: 2 });
    expect(result.message).not.toMatch(/error|exception/i);
  });
});
