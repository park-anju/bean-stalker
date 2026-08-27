import { describe, expect, it } from 'vitest';
import { CafeSchema, type CafeSearchRequest } from '@bean-stalker/contracts';
import { FixtureCafeProvider } from './fixtureCafeProvider.js';

const request: CafeSearchRequest = {
  center: { latitude: 1.5535, longitude: 110.3593 },
  radiusMeters: 2000,
  maxResults: 10,
  rankPreference: 'DISTANCE',
};

describe('FixtureCafeProvider', () => {
  it('serves the committed fixture normalized into valid Cafe contracts', async () => {
    const cafes = await new FixtureCafeProvider().searchNearby(request);

    expect(cafes.length).toBeGreaterThan(0);
    for (const cafe of cafes) {
      expect(() => CafeSchema.parse(cafe)).not.toThrow();
      expect(cafe.distanceMeters).toBeGreaterThanOrEqual(0);
    }
    // Honest normalization: the unrated fixture entry keeps no rating and
    // UNKNOWN open status rather than fabricated values.
    const unrated = cafes.find((cafe) => cafe.name === 'Unrated Roastery');
    expect(unrated?.rating).toBeUndefined();
    expect(unrated?.openStatus).toBe('UNKNOWN');
  });

  it('never returns more than the requested maxResults', async () => {
    const cafes = await new FixtureCafeProvider().searchNearby({ ...request, maxResults: 2 });
    expect(cafes).toHaveLength(2);
  });

  it('computes distance relative to the supplied search center', async () => {
    const near = await new FixtureCafeProvider().searchNearby(request);
    const far = await new FixtureCafeProvider().searchNearby({
      ...request,
      center: { latitude: 10, longitude: 100 },
    });
    const nearFirst = near[0]?.distanceMeters ?? 0;
    const farFirst = far[0]?.distanceMeters ?? 0;
    expect(farFirst).toBeGreaterThan(nearFirst);
  });
});
