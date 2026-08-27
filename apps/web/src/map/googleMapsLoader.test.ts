import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadGoogleMaps, resetGoogleMapsLoaderForTests } from './googleMapsLoader.js';

const SCRIPT_ID = 'bean-stalker-google-maps-script';
const CALLBACK_NAME = '__beanStalkerGoogleMapsLoaded';

function clearInjectedScript() {
  document.getElementById(SCRIPT_ID)?.remove();
}

function getInjectedScript(): HTMLScriptElement | null {
  return document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
}

beforeEach(() => {
  resetGoogleMapsLoaderForTests();
  clearInjectedScript();
  Reflect.deleteProperty(window, 'google');
  Reflect.deleteProperty(window, CALLBACK_NAME);
});

afterEach(() => {
  clearInjectedScript();
});

describe('loadGoogleMaps', () => {
  it('resolves immediately without injecting a script if google.maps.importLibrary already exists', async () => {
    Object.defineProperty(window, 'google', {
      value: { maps: { importLibrary: () => Promise.resolve({}) } },
      configurable: true,
    });

    await expect(loadGoogleMaps('test-key')).resolves.toBeUndefined();
    expect(getInjectedScript()).toBeNull();
  });

  it('injects exactly one script tag even when called multiple times concurrently', () => {
    void loadGoogleMaps('test-key');
    void loadGoogleMaps('test-key');
    void loadGoogleMaps('test-key');

    expect(document.querySelectorAll(`#${SCRIPT_ID}`)).toHaveLength(1);
  });

  it('resolves once the Maps callback fires', async () => {
    const promise = loadGoogleMaps('test-key');
    const callback = window[CALLBACK_NAME];
    expect(typeof callback).toBe('function');

    callback?.();

    await expect(promise).resolves.toBeUndefined();
  });

  it('rejects with a clear message if the script fails to load, without leaking Google internals', async () => {
    const promise = loadGoogleMaps('test-key');
    const script = getInjectedScript();
    script?.dispatchEvent(new Event('error'));

    await expect(promise).rejects.toThrow('The Google Maps script failed to load.');
  });

  it('allows a fresh load attempt after a prior failure', async () => {
    const failedPromise = loadGoogleMaps('test-key');
    getInjectedScript()?.dispatchEvent(new Event('error'));
    await expect(failedPromise).rejects.toThrow();

    clearInjectedScript();
    const retryPromise = loadGoogleMaps('test-key');
    window[CALLBACK_NAME]?.();

    await expect(retryPromise).resolves.toBeUndefined();
  });

  it('requests async, versioned loading and encodes the key in the script URL', () => {
    void loadGoogleMaps('a key/with special?chars');
    const script = getInjectedScript();

    expect(script?.src).toContain('loading=async');
    expect(script?.src).toContain('v=weekly');
    expect(script?.src).toContain(encodeURIComponent('a key/with special?chars'));
    expect(script?.async).toBe(true);
  });
});
