import type { LocationErrorReason } from './locationState.js';

// Standardized GeolocationPositionError.code values (also exposed as instance
// properties of the same name by the spec, but comparing against these local
// constants keeps this function testable with plain { code, message } objects).
const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;
const TIMEOUT = 3;

export interface MappedLocationError {
  reason: LocationErrorReason;
  kind: 'permission-denied' | 'position-unavailable' | 'timeout' | 'unexpected';
  message: string;
  canRetry: boolean;
}

/**
 * Error Catalog has no dedicated codes for POSITION_UNAVAILABLE vs TIMEOUT —
 * both get the same recommended treatment (bounded guidance and explicit retry), so both
 * map to LOCATION_UNAVAILABLE rather than inventing new location-specific codes.
 */
export function mapGeolocationError(error: { code: number }): MappedLocationError {
  switch (error.code) {
    case PERMISSION_DENIED:
      return {
        reason: 'LOCATION_PERMISSION_DENIED',
        kind: 'permission-denied',
        message:
          "Location access is blocked for this site. Change this site's Location permission in your browser settings, then choose Try location again. Bean Stalker cannot change this setting for you.",
        canRetry: true,
      };
    case POSITION_UNAVAILABLE:
      return {
        reason: 'LOCATION_UNAVAILABLE',
        kind: 'position-unavailable',
        message:
          'Bean Stalker could not access your device location. Check that location services are enabled for your device and that this browser is allowed to use them, then try again.',
        canRetry: true,
      };
    case TIMEOUT:
      return {
        reason: 'LOCATION_UNAVAILABLE',
        kind: 'timeout',
        message: 'Finding your location took too long. Check your connection, then try again.',
        canRetry: true,
      };
    default:
      return {
        reason: 'LOCATION_UNAVAILABLE',
        kind: 'unexpected',
        message:
          'Bean Stalker could not access your device location. Check device location services and this browser’s permission, then try again.',
        canRetry: true,
      };
  }
}
