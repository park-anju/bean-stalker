import { describe, expect, it } from 'vitest';
import type { Cafe } from '@bean-stalker/contracts';

import {
  cafeCardAccessibilityLabel,
  formatCafeDistance,
  formatCafeOpenStatus,
} from './cafe-presentation';

const completeCafe: Cafe = {
  placeId: 'fixture/complete',
  name: 'Kopi Kenangan',
  location: { latitude: 1, longitude: 2 },
  rating: 4.6,
  formattedAddress: 'Jalan Coffee, Kuching',
  openStatus: 'OPEN',
  distanceMeters: 420,
};

describe('cafe presentation helpers', () => {
  it('describes complete café data without inventing fields', () => {
    expect(cafeCardAccessibilityLabel(completeCafe)).toBe(
      'Kopi Kenangan, 420 m, rated 4.6, Open, Jalan Coffee, Kuching',
    );
  });

  it('gracefully omits missing optional data', () => {
    const cafe: Cafe = {
      ...completeCafe,
      rating: undefined,
      formattedAddress: undefined,
      openStatus: 'UNKNOWN',
    };
    expect(cafeCardAccessibilityLabel(cafe)).toBe('Kopi Kenangan, 420 m, Hours unavailable');
  });

  it.each([
    [0, '0 m'],
    [320, '320 m'],
    [999, '999 m'],
    [1000, '1.0 km'],
    [1250, '1.3 km'],
  ])('formats %s meters as %s', (meters, expected) => {
    expect(formatCafeDistance(meters)).toBe(expected);
  });

  it.each([
    ['OPEN', 'Open'],
    ['CLOSED', 'Closed'],
    ['UNKNOWN', 'Hours unavailable'],
  ] as const)('formats %s opening status as %s', (status, expected) => {
    expect(formatCafeOpenStatus(status)).toBe(expected);
  });
});
