const SCRIPT_ID = 'bean-stalker-google-maps-script';
const CALLBACK_NAME = '__beanStalkerGoogleMapsLoaded';

declare global {
  interface Window {
    [CALLBACK_NAME]?: () => void;
  }
}

let loadPromise: Promise<void> | null = null;

function isGoogleMapsReady(): boolean {
  return typeof window !== 'undefined' && Boolean(window.google?.maps?.importLibrary);
}

/**
 * Loads the Google Maps JavaScript API exactly once, however many times this
 * is called or however many CafeMap instances mount. Uses the current
 * documented `loading=async` + `callback` pattern (not the deprecated
 * synchronous script tag), after which `google.maps.importLibrary` is
 * available for on-demand library loading.
 */
export function loadGoogleMaps(apiKey: string): Promise<void> {
  if (isGoogleMapsReady()) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<void>((resolve, reject) => {
    if (document.getElementById(SCRIPT_ID)) {
      // A previous load is already in flight; piggyback on its callback
      // instead of injecting a second script tag.
      const previousCallback = window[CALLBACK_NAME];
      window[CALLBACK_NAME] = () => {
        previousCallback?.();
        resolve();
      };
      return;
    }

    window[CALLBACK_NAME] = () => resolve();

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&callback=${CALLBACK_NAME}`;
    script.async = true;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('The Google Maps script failed to load.'));
    };
    document.head.append(script);
  });

  return loadPromise;
}

/** Test-only: clears the cached load promise so each test starts fresh. */
export function resetGoogleMapsLoaderForTests(): void {
  loadPromise = null;
}
