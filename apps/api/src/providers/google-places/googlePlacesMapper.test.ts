import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { haversineDistanceMeters } from '@bean-stalker/domain';
import { describe, expect, it } from 'vitest';
import { mapGooglePlaceToCafe } from './googlePlacesMapper.js';
import { GoogleSearchNearbyResponseSchema } from './googlePlacesSchemas.js';
import type { GooglePlace } from './googlePlacesSchemas.js';

function loadFixture(name: string): unknown {
  const path = resolve(process.cwd(), '../../tests/fixtures', name);
  return JSON.parse(readFileSync(path, 'utf8'));
}

function getPlace(places: readonly GooglePlace[], id: string): GooglePlace {
  const place = places.find((p) => p.id === id);
  if (!place) throw new Error(`fixture is missing expected place "${id}"`);
  return place;
}

const searchCenter = { latitude: 1.5535, longitude: 110.3593 };

describe('mapGooglePlaceToCafe', () => {
  const happy = GoogleSearchNearbyResponseSchema.parse(loadFixture('nearby-cafes-happy.json'));
  const places = happy.places ?? [];

  it('maps a fully-populated place (rated, open, priced) to a Cafe', () => {
    const place = getPlace(places, 'places/kopi-kenangan');
    const cafe = mapGooglePlaceToCafe(place, searchCenter);

    expect(cafe).toMatchObject({
      placeId: 'places/kopi-kenangan',
      name: 'Kopi Kenangan',
      formattedAddress: '12 Jalan Padungan, Kuching, Sarawak',
      rating: 4.8,
      userRatingCount: 342,
      priceLevel: 'PRICE_LEVEL_MODERATE',
      openStatus: 'OPEN',
      businessStatus: 'OPERATIONAL',
      googleMapsUri: 'https://maps.google.com/?cid=1111111111111111111',
    });
    expect(cafe.distanceMeters).toBeGreaterThan(0);
  });

  it('leaves rating, address, price, and business status absent rather than fabricated when Google omits them', () => {
    const place = getPlace(places, 'places/unrated-roastery');
    const cafe = mapGooglePlaceToCafe(place, searchCenter);

    expect(cafe.rating).toBeUndefined();
    expect(cafe.userRatingCount).toBeUndefined();
    expect(cafe.priceLevel).toBeUndefined();
    expect(cafe.formattedAddress).toBeUndefined();
    expect(cafe.businessStatus).toBeUndefined();
    // Still a fully valid, usable Cafe despite all the missing optional fields.
    expect(cafe.placeId).toBe('places/unrated-roastery');
    expect(cafe.openStatus).toBe('UNKNOWN');
  });

  it('maps openNow: false to CLOSED', () => {
    const place = getPlace(places, 'places/old-town-cafe');
    expect(mapGooglePlaceToCafe(place, searchCenter).openStatus).toBe('CLOSED');
  });

  it('maps a place with no currentOpeningHours at all to UNKNOWN, never CLOSED', () => {
    const place = getPlace(places, 'places/hidden-bean');
    expect(mapGooglePlaceToCafe(place, searchCenter).openStatus).toBe('UNKNOWN');
  });

  it('computes distanceMeters using the shared domain Haversine helper, not a duplicate formula', () => {
    const place = getPlace(places, 'places/river-cafe');
    const cafe = mapGooglePlaceToCafe(place, searchCenter);
    // Cross-check against the same helper directly — this is really testing
    // that the mapper delegates rather than reimplementing the math.
    expect(cafe.distanceMeters).toBe(haversineDistanceMeters(searchCenter, place.location));
  });
});

describe('GoogleSearchNearbyResponseSchema', () => {
  it('treats a response with no "places" key as zero results, not an error (Google omits the key entirely)', () => {
    const result = GoogleSearchNearbyResponseSchema.safeParse(
      loadFixture('nearby-cafes-empty.json'),
    );
    expect(result.success).toBe(true);
    expect(result.success && (result.data.places ?? [])).toEqual([]);
  });

  it('rejects a response where a place is missing its required id', () => {
    const result = GoogleSearchNearbyResponseSchema.safeParse(
      loadFixture('nearby-cafes-malformed.json'),
    );
    expect(result.success).toBe(false);
  });
});
