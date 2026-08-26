import { describe, expect, it } from 'vitest';
import { haversineDistanceMeters } from './distance.js';
import type { LatLng } from '@bean-stalker/contracts';

const kuchingCafe: LatLng = { latitude: 1.5535, longitude: 110.3593 };

describe('haversineDistanceMeters', () => {
  it('returns zero for the same coordinate', () => {
    expect(haversineDistanceMeters(kuchingCafe, kuchingCafe)).toBe(0);
  });

  it('is symmetric: distance(A, B) equals distance(B, A)', () => {
    const other: LatLng = { latitude: 1.4735, longitude: 110.4293 };
    expect(haversineDistanceMeters(kuchingCafe, other)).toBeCloseTo(
      haversineDistanceMeters(other, kuchingCafe),
      10,
    );
  });

  it('matches the exact meridian identity for a 1-degree latitude change (R * delta-radians)', () => {
    const from: LatLng = { latitude: 0, longitude: 0 };
    const to: LatLng = { latitude: 1, longitude: 0 };
    // For zero longitude change, Haversine reduces exactly to Earth radius times the
    // latitude delta in radians — this is an exact identity, not an approximation,
    // so a tight tolerance is appropriate here.
    expect(haversineDistanceMeters(from, to)).toBeCloseTo(111194.93, 1);
  });

  it('reports a plausible short walking-scale distance for two nearby cafes (few hundred metres)', () => {
    const nearbyCafe: LatLng = { latitude: 1.556, longitude: 110.3593 };
    const distance = haversineDistanceMeters(kuchingCafe, nearbyCafe);
    expect(distance).toBeGreaterThan(200);
    expect(distance).toBeLessThan(400);
  });

  it('does not mix units: doubling the coordinate delta roughly doubles the distance for small offsets', () => {
    const small: LatLng = {
      latitude: kuchingCafe.latitude + 0.001,
      longitude: kuchingCafe.longitude,
    };
    const double: LatLng = {
      latitude: kuchingCafe.latitude + 0.002,
      longitude: kuchingCafe.longitude,
    };
    const smallDistance = haversineDistanceMeters(kuchingCafe, small);
    const doubleDistance = haversineDistanceMeters(kuchingCafe, double);
    expect(doubleDistance).toBeCloseTo(smallDistance * 2, 0);
  });
});
