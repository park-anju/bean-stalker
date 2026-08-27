import { haversineDistanceMeters } from '@bean-stalker/domain';
import type { Cafe, LatLng, OpenStatus } from '@bean-stalker/contracts';
import type { GooglePlace } from './googlePlacesSchemas.js';

function mapOpenStatus(place: GooglePlace): OpenStatus {
  const openNow = place.currentOpeningHours?.openNow;
  if (openNow === true) return 'OPEN';
  if (openNow === false) return 'CLOSED';
  return 'UNKNOWN';
}

export function mapGooglePlaceToCafe(place: GooglePlace, searchCenter: LatLng): Cafe {
  return {
    placeId: place.id,
    name: place.displayName.text,
    location: place.location,
    formattedAddress: place.formattedAddress,
    rating: place.rating,
    userRatingCount: place.userRatingCount,
    priceLevel: place.priceLevel,
    openStatus: mapOpenStatus(place),
    businessStatus: place.businessStatus,
    googleMapsUri: place.googleMapsUri,
    distanceMeters: haversineDistanceMeters(searchCenter, place.location),
  };
}
