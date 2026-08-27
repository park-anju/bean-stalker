import { describe, expect, it } from 'vitest';
import { LatLngSchema, SearchCenterSchema } from './geo.js';

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

describe('SearchCenterSchema', () => {
  it('accepts a center with an optional label', () => {
    expect(
      SearchCenterSchema.safeParse({ latitude: 1.55, longitude: 110.36, label: 'Home' }).success,
    ).toBe(true);
  });

  it('accepts a center without a label, since current-location origins have none', () => {
    expect(SearchCenterSchema.safeParse({ latitude: 1.55, longitude: 110.36 }).success).toBe(true);
  });

  it('still enforces the same latitude/longitude bounds as LatLng', () => {
    expect(SearchCenterSchema.safeParse({ latitude: 91, longitude: 0 }).success).toBe(false);
  });

  it('rejects an empty label rather than silently accepting a meaningless one', () => {
    expect(SearchCenterSchema.safeParse({ latitude: 0, longitude: 0, label: '' }).success).toBe(
      false,
    );
  });
});
