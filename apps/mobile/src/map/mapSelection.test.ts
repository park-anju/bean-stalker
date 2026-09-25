import { describe, expect, it } from 'vitest';

import { cafeIndexById, reconcileSelectedCafeId, selectCafeId } from './mapSelection';

const cafes = [{ placeId: 'cafe-a' }, { placeId: 'cafe-b' }];

describe('map/list selection boundary', () => {
  it('uses the stable café ID for marker and card selection', () => {
    expect(selectCafeId('cafe-a')).toBe('cafe-a');
    expect(selectCafeId('cafe-a')).toBe(selectCafeId('cafe-a'));
  });

  it('reconciles selection against the authoritative café result set', () => {
    expect(reconcileSelectedCafeId(cafes, 'cafe-b')).toBe('cafe-b');
    expect(reconcileSelectedCafeId(cafes, 'removed-cafe')).toBeNull();
    expect(reconcileSelectedCafeId(cafes, null)).toBeNull();
  });

  it('finds the list index by stable café ID', () => {
    expect(cafeIndexById(cafes, 'cafe-b')).toBe(1);
    expect(cafeIndexById(cafes, 'missing')).toBe(-1);
  });
});
