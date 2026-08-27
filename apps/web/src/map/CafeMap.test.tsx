import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SearchCenter } from '@bean-stalker/contracts';
import { CafeMap } from './CafeMap.js';
import { loadGoogleMaps } from './googleMapsLoader.js';

vi.mock('./googleMapsLoader.js', () => ({
  loadGoogleMaps: vi.fn(),
}));

class FakeMap {
  static instances: FakeMap[] = [];
  center: google.maps.LatLngLiteral;
  setCenterCalls: google.maps.LatLngLiteral[] = [];

  constructor(
    public container: HTMLElement,
    options: { center: google.maps.LatLngLiteral; zoom: number },
  ) {
    this.center = options.center;
    FakeMap.instances.push(this);
  }

  setCenter(position: google.maps.LatLngLiteral) {
    this.center = position;
    this.setCenterCalls.push(position);
  }
}

const center: SearchCenter = { latitude: 1.5535, longitude: 110.3593 };
const otherCenter: SearchCenter = { latitude: 1.56, longitude: 110.36 };

beforeEach(() => {
  FakeMap.instances = [];
  vi.mocked(loadGoogleMaps).mockResolvedValue(undefined);
  Object.defineProperty(window, 'google', {
    value: { maps: { importLibrary: vi.fn().mockResolvedValue({ Map: FakeMap }) } },
    configurable: true,
  });
});

afterEach(() => {
  Reflect.deleteProperty(window, 'google');
  vi.clearAllMocks();
});

describe('CafeMap', () => {
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

  it('initializes exactly one map instance, centered on the resolved SearchCenter', async () => {
    render(<CafeMap center={center} />);

    await waitFor(() => expect(FakeMap.instances).toHaveLength(1));
    expect(FakeMap.instances[0]?.center).toEqual({ lat: center.latitude, lng: center.longitude });
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
