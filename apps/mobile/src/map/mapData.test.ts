import { describe, expect, it } from 'vitest';
import type { Cafe } from '@bean-stalker/contracts';

import { getCafeMarkerData, getMapCoordinates } from './mapData';

const cafe = (placeId: string, latitude: number, longitude: number): Cafe => ({
  placeId,
  name: placeId,
  location: { latitude, longitude },
  openStatus: 'UNKNOWN',
  distanceMeters: 100,
});

describe('map data boundary', () => {
  it('extracts valid café coordinates with stable café IDs', () => {
    expect(getCafeMarkerData([cafe('cafe-a', 1, 2)])).toEqual([
      { id: 'cafe-a', title: 'cafe-a', coordinate: { latitude: 1, longitude: 2 } },
    ]);
  });

  it('skips invalid marker coordinates without dropping list data', () => {
    expect(getCafeMarkerData([cafe('invalid', 91, 2), cafe('valid', 1, 2)])).toEqual([
      { id: 'valid', title: 'valid', coordinate: { latitude: 1, longitude: 2 } },
    ]);
  });

  it('always includes the current verified center in map coordinates', () => {
    expect(getMapCoordinates({ latitude: 3, longitude: 4 }, [cafe('cafe-a', 1, 2)])).toEqual([
      { latitude: 3, longitude: 4 },
      { latitude: 1, longitude: 2 },
    ]);
  });
});
