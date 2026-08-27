import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Cafe, SearchCenter } from '@bean-stalker/contracts';
import { CafeMap } from './CafeMap.js';
import { loadGoogleMaps } from './googleMapsLoader.js';

vi.mock('./googleMapsLoader.js', () => ({
  loadGoogleMaps: vi.fn(),
}));

class FakeMap {
  static instances: FakeMap[] = [];
  center: google.maps.LatLngLiteral;
  setCenterCalls: google.maps.LatLngLiteral[] = [];
  panToCalls: google.maps.LatLngLiteral[] = [];
  mapId: string | undefined;

  constructor(
    public container: HTMLElement,
    options: { center: google.maps.LatLngLiteral; zoom: number; mapId?: string },
  ) {
    this.center = options.center;
    this.mapId = options.mapId;
    FakeMap.instances.push(this);
  }

  setCenter(position: google.maps.LatLngLiteral) {
    this.center = position;
    this.setCenterCalls.push(position);
  }

  panTo(position: google.maps.LatLngLiteral) {
    this.panToCalls.push(position);
  }
}

interface FakeMarkerOptions {
  map: unknown;
  position: google.maps.LatLngLiteral;
  title: string;
  gmpClickable?: boolean;
}

class FakeMarker {
  static instances: FakeMarker[] = [];
  map: unknown;
  position: google.maps.LatLngLiteral;
  title: string;
  content: Node | null = null;
  zIndex: number | null = null;
  private listeners = new Map<string, Set<() => void>>();

  constructor(options: FakeMarkerOptions) {
    this.map = options.map;
    this.position = options.position;
    this.title = options.title;
    FakeMarker.instances.push(this);
  }

  addEventListener(type: string, handler: () => void) {
    const set = this.listeners.get(type) ?? new Set();
    set.add(handler);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, handler: () => void) {
    this.listeners.get(type)?.delete(handler);
  }

  emit(type: string) {
    for (const handler of this.listeners.get(type) ?? []) handler();
  }
}

class FakePin {
  element: HTMLElement;
  constructor(public options: Record<string, unknown>) {
    this.element = document.createElement('div');
  }
}

const center: SearchCenter = { latitude: 1.5535, longitude: 110.3593 };
const otherCenter: SearchCenter = { latitude: 1.56, longitude: 110.36 };

const cafeA: Cafe = {
  placeId: 'places/a',
  name: 'Cafe A',
  location: { latitude: 1.5551, longitude: 110.3489 },
  openStatus: 'OPEN',
  distanceMeters: 100,
};
const cafeB: Cafe = {
  placeId: 'places/b',
  name: 'Cafe B',
  location: { latitude: 1.5525, longitude: 110.3465 },
  openStatus: 'CLOSED',
  distanceMeters: 200,
};

beforeEach(() => {
  FakeMap.instances = [];
  FakeMarker.instances = [];
  vi.mocked(loadGoogleMaps).mockResolvedValue(undefined);
  Object.defineProperty(window, 'google', {
    value: {
      maps: {
        importLibrary: vi
          .fn()
          .mockImplementation((library: string) =>
            library === 'marker'
              ? Promise.resolve({ AdvancedMarkerElement: FakeMarker, PinElement: FakePin })
              : Promise.resolve({ Map: FakeMap }),
          ),
      },
    },
    configurable: true,
  });
});

afterEach(() => {
  Reflect.deleteProperty(window, 'google');
  vi.clearAllMocks();
});

describe('CafeMap — map lifecycle', () => {
  it('shows a location-first message when no center is resolved yet, and never loads Google Maps', () => {
    render(<CafeMap center={undefined} />);
    expect(screen.getByText(/set a location above/i)).toBeInTheDocument();
    expect(loadGoogleMaps).not.toHaveBeenCalled();
  });

  it('shows an accessible loading state while the map initializes', async () => {
    let resolveLoad!: () => void;
    vi.mocked(loadGoogleMaps).mockReturnValue(new Promise((resolve) => (resolveLoad = resolve)));

    render(<CafeMap center={center} />);

    expect(screen.getByRole('status')).toHaveTextContent(/loading map/i);
    resolveLoad();
    await waitFor(() => expect(FakeMap.instances).toHaveLength(1));
  });

  it('initializes exactly one map instance, centered on the resolved SearchCenter, with a Map ID', async () => {
    render(<CafeMap center={center} />);

    await waitFor(() => expect(FakeMap.instances).toHaveLength(1));
    expect(FakeMap.instances[0]?.center).toEqual({ lat: center.latitude, lng: center.longitude });
    expect(FakeMap.instances[0]?.mapId).toBe('DEMO_MAP_ID');
  });

  it('re-centers the existing map instance on a location change, rather than creating a second map', async () => {
    const { rerender } = render(<CafeMap center={center} />);
    await waitFor(() => expect(FakeMap.instances).toHaveLength(1));

    rerender(<CafeMap center={otherCenter} />);

    await waitFor(() =>
      expect(FakeMap.instances[0]?.setCenterCalls).toContainEqual({
        lat: otherCenter.latitude,
        lng: otherCenter.longitude,
      }),
    );
    expect(FakeMap.instances).toHaveLength(1);
  });

  it('shows a non-crashing status message if the Maps script fails to load', async () => {
    vi.mocked(loadGoogleMaps).mockRejectedValue(
      new Error('The Google Maps script failed to load.'),
    );
    render(<CafeMap center={center} />);
    expect(await screen.findByText(/map is unavailable/i)).toBeInTheDocument();
  });

  it('returns to the location-first message if the center is cleared after being resolved', async () => {
    const { rerender } = render(<CafeMap center={center} />);
    await waitFor(() => expect(FakeMap.instances).toHaveLength(1));

    rerender(<CafeMap center={undefined} />);
    expect(screen.getByText(/set a location above/i)).toBeInTheDocument();
  });
});

describe('CafeMap — markers', () => {
  it('renders one Advanced Marker per cafe, titled by cafe name', async () => {
    render(<CafeMap center={center} cafes={[cafeA, cafeB]} />);

    await waitFor(() => expect(FakeMarker.instances).toHaveLength(2));
    expect(FakeMarker.instances.map((m) => m.title).sort()).toEqual(['Cafe A', 'Cafe B']);
  });

  it('removes markers dropped from the result set without leaving duplicates', async () => {
    const { rerender } = render(<CafeMap center={center} cafes={[cafeA, cafeB]} />);
    await waitFor(() => expect(FakeMarker.instances).toHaveLength(2));

    rerender(<CafeMap center={center} cafes={[cafeA]} />);

    await waitFor(() => {
      const live = FakeMarker.instances.filter((m) => m.map !== null);
      expect(live).toHaveLength(1);
      expect(live[0]?.title).toBe('Cafe A');
    });
  });

  it('clears every marker when results become empty', async () => {
    const { rerender } = render(<CafeMap center={center} cafes={[cafeA, cafeB]} />);
    await waitFor(() => expect(FakeMarker.instances).toHaveLength(2));

    rerender(<CafeMap center={center} cafes={[]} />);
    await waitFor(() => expect(FakeMarker.instances.every((m) => m.map === null)).toBe(true));
  });

  it('reports a marker click back through onSelectCafe', async () => {
    const onSelectCafe = vi.fn();
    render(<CafeMap center={center} cafes={[cafeA, cafeB]} onSelectCafe={onSelectCafe} />);
    await waitFor(() => expect(FakeMarker.instances).toHaveLength(2));

    const markerB = FakeMarker.instances.find((m) => m.title === 'Cafe B');
    markerB?.emit('gmp-click');
    expect(onSelectCafe).toHaveBeenCalledWith('places/b');
  });

  it('restyles and pans to the selected cafe without creating markers or searching', async () => {
    const { rerender } = render(<CafeMap center={center} cafes={[cafeA, cafeB]} />);
    await waitFor(() => expect(FakeMarker.instances).toHaveLength(2));

    rerender(<CafeMap center={center} cafes={[cafeA, cafeB]} selectedCafeId="places/b" />);

    await waitFor(() => {
      const markerB = FakeMarker.instances.find((m) => m.title === 'Cafe B');
      expect(markerB?.content).not.toBeNull();
      expect(FakeMap.instances[0]?.panToCalls).toContainEqual({
        lat: cafeB.location.latitude,
        lng: cafeB.location.longitude,
      });
    });
    expect(FakeMarker.instances).toHaveLength(2);
  });
});

describe('CafeMap — graceful degradation', () => {
  it('when the map fails to load, markers are never requested and the failure is contained', async () => {
    vi.mocked(loadGoogleMaps).mockRejectedValue(new Error('boom'));

    render(<CafeMap center={center} cafes={[cafeA, cafeB]} />);

    expect(await screen.findByText(/map is unavailable/i)).toBeInTheDocument();
    expect(FakeMarker.instances).toHaveLength(0);
  });
});
