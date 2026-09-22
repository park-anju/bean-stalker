export interface GeolocationAdapter {
  isSecureContext(): boolean;
  isSupported(): boolean;
  getCurrentPosition(): Promise<GeolocationPosition>;
}

// Cafe discovery does not need GPS-level precision, so high accuracy is left
// off to save battery/time. A short-lived cached fix (up to 1 minute old) is
// accepted rather than forcing a fresh read on every request; 10s timeout
// keeps the "resolving" state from hanging indefinitely. None of these values
// are specified by Location Resolution.md — documented here as an assumption.
const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 60_000,
};

export const browserGeolocationAdapter: GeolocationAdapter = {
  isSecureContext() {
    // `isSecureContext` is the browser's authoritative classification. Treat
    // an older browser that does not expose it as unknown and still attempt
    // Geolocation rather than creating a new compatibility requirement.
    return typeof window !== 'undefined' && window.isSecureContext !== false;
  },

  isSupported() {
    return (
      typeof navigator !== 'undefined' &&
      typeof navigator.geolocation?.getCurrentPosition === 'function'
    );
  },

  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, GEOLOCATION_OPTIONS);
    });
  },
};
