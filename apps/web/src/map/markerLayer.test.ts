import { describe, expect, it, vi } from 'vitest';
import type { Cafe } from '@bean-stalker/contracts';
import { MarkerLayer, type MarkerLibrary } from './markerLayer.js';

class FakeMarker {
  static instances: FakeMarker[] = [];
  map: unknown;
  position: unknown;
  title: string;
  content: unknown = null;
  zIndex: number | null = null;
  listeners = new Map<string, () => void>();

  constructor(options: { map: unknown; position: unknown; title: string }) {
    this.map = options.map;
    this.position = options.position;
    this.title = options.title;
    FakeMarker.instances.push(this);
  }
  addEventListener(type: string, handler: () => void) {
    this.listeners.set(type, handler);
  }
  removeEventListener(type: string) {
    this.listeners.delete(type);
  }
}

class FakePin {
  element = document.createElement('div');
  constructor(public options: unknown) {}
}

function makeLib(): MarkerLibrary {
  return {
    AdvancedMarkerElement: FakeMarker as unknown as MarkerLibrary['AdvancedMarkerElement'],
    PinElement: FakePin as unknown as MarkerLibrary['PinElement'],
  };
}

const fakeMap = { panTo: vi.fn() } as unknown as google.maps.Map;

const cafeA: Cafe = {
  placeId: 'a',
  name: 'A',
  location: { latitude: 1, longitude: 2 },
  openStatus: 'OPEN',
  distanceMeters: 1,
};
const cafeB: Cafe = {
  placeId: 'b',
  name: 'B',
  location: { latitude: 3, longitude: 4 },
  openStatus: 'OPEN',
  distanceMeters: 2,
};

describe('MarkerLayer', () => {
  it('creates one marker per cafe and updates position on re-sync instead of duplicating', () => {
    FakeMarker.instances = [];
    const layer = new MarkerLayer(fakeMap, makeLib(), vi.fn());

    layer.sync([cafeA, cafeB]);
    expect(layer.size).toBe(2);

    layer.sync([{ ...cafeA, location: { latitude: 9, longitude: 9 } }, cafeB]);
    expect(layer.size).toBe(2);
    expect(FakeMarker.instances).toHaveLength(2); // no new marker created
    expect(FakeMarker.instances[0]?.position).toEqual({ lat: 9, lng: 9 });
  });

  it('removes markers dropped from the set and detaches their listeners', () => {
    FakeMarker.instances = [];
    const layer = new MarkerLayer(fakeMap, makeLib(), vi.fn());
    layer.sync([cafeA, cafeB]);

    layer.sync([cafeB]);

    expect(layer.size).toBe(1);
    const removed = FakeMarker.instances.find((m) => m.title === 'A');
    expect(removed?.map).toBeNull();
    expect(removed?.listeners.size).toBe(0);
  });

  it('invokes the select callback with the cafe placeId on marker click', () => {
    FakeMarker.instances = [];
    const onSelect = vi.fn();
    const layer = new MarkerLayer(fakeMap, makeLib(), onSelect);
    layer.sync([cafeA]);

    FakeMarker.instances[0]?.listeners.get('gmp-click')?.();
    expect(onSelect).toHaveBeenCalledWith('a');
  });

  it('styles only the selected marker and pans the map to it', () => {
    FakeMarker.instances = [];
    const layer = new MarkerLayer(fakeMap, makeLib(), vi.fn());
    layer.sync([cafeA, cafeB]);

    layer.setSelected('b', [cafeA, cafeB]);

    const markerA = FakeMarker.instances.find((m) => m.title === 'A');
    const markerB = FakeMarker.instances.find((m) => m.title === 'B');
    expect(markerA?.content).toBeNull();
    expect(markerB?.content).not.toBeNull();
    expect(markerB?.zIndex).toBe(1);
    expect(fakeMap.panTo).toHaveBeenCalledWith({ lat: 3, lng: 4 });
  });

  it('destroy() removes every marker', () => {
    FakeMarker.instances = [];
    const layer = new MarkerLayer(fakeMap, makeLib(), vi.fn());
    layer.sync([cafeA, cafeB]);

    layer.destroy();

    expect(layer.size).toBe(0);
    expect(FakeMarker.instances.every((m) => m.map === null)).toBe(true);
  });
});
