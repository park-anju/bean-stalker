import { describe, expect, it } from 'vitest';

import { buildInitialMapRegion } from './mapRegion';

describe('map region', () => {
  it('fits the verified center and café coordinates without hardcoded city coordinates', () => {
    expect(
      buildInitialMapRegion([
        { latitude: 1, longitude: 2 },
        { latitude: 3, longitude: 6 },
      ]),
    ).toEqual({
      latitude: 2,
      longitude: 4,
      latitudeDelta: 3,
      longitudeDelta: 6,
    });
  });

  it('keeps a single-coordinate map region usable', () => {
    expect(buildInitialMapRegion([{ latitude: 1, longitude: 2 }])).toMatchObject({
      latitude: 1,
      longitude: 2,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  });
});
