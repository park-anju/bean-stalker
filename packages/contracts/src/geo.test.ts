import { describe, expect, it } from 'vitest';
import { LatLngSchema } from './geo.js';

describe('LatLngSchema', () => {
  it('accepts the boundary values of the valid coordinate range', () => {
    expect(LatLngSchema.safeParse({ latitude: -90, longitude: -180 }).success).toBe(true);
    expect(LatLngSchema.safeParse({ latitude: 90, longitude: 180 }).success).toBe(true);
  });

  it('rejects latitude outside [-90, 90]', () => {
    expect(LatLngSchema.safeParse({ latitude: 90.1, longitude: 0 }).success).toBe(false);
    expect(LatLngSchema.safeParse({ latitude: -90.1, longitude: 0 }).success).toBe(false);
  });

  it('rejects longitude outside [-180, 180]', () => {
    expect(LatLngSchema.safeParse({ latitude: 0, longitude: 180.1 }).success).toBe(false);
    expect(LatLngSchema.safeParse({ latitude: 0, longitude: -180.1 }).success).toBe(false);
  });

  it('rejects a center missing a coordinate', () => {
    expect(LatLngSchema.safeParse({ latitude: 0 }).success).toBe(false);
  });
});
