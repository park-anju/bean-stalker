import type { LocationErrorReason } from './locationState.js';

// Standardized GeolocationPositionError.code values (also exposed as instance
// properties of the same name by the spec, but comparing against these local
// constants keeps this function testable with plain { code, message } objects).
const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;
const TIMEOUT = 3;

export interface MappedLocationError {
  reason: LocationErrorReason;
  message: string;
}

/**
 * Error Catalog has no dedicated codes for POSITION_UNAVAILABLE vs TIMEOUT —
 * both get the same recommended treatment ("retry/manual location"), so both
 * map to LOCATION_UNAVAILABLE rather than inventing new location-specific codes.
 */
export function mapGeolocationError(error: { code: number }): MappedLocationError {
  switch (error.code) {
    case PERMISSION_DENIED:
      return {
        reason: 'LOCATION_PERMISSION_DENIED',
        message: 'Location permission was denied. Enter a location manually below.',
      };
    case POSITION_UNAVAILABLE:
      return {
        reason: 'LOCATION_UNAVAILABLE',
        message: 'Your location could not be determined. Try again or enter one manually.',
      };
    case TIMEOUT:
      return {
        reason: 'LOCATION_UNAVAILABLE',
        message: 'Finding your location took too long. Try again or enter one manually.',
      };
    default:
      return {
        reason: 'LOCATION_UNAVAILABLE',
        message: 'Your location could not be determined. Try again or enter one manually.',
      };
  }
}
