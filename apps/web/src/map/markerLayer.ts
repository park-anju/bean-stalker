import type { Cafe } from '@bean-stalker/contracts';

export interface MarkerLibrary {
  AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
  PinElement: typeof google.maps.marker.PinElement;
}

interface TrackedMarker {
  marker: google.maps.marker.AdvancedMarkerElement;
  handler: () => void;
}

const SELECTED_PIN = {
  background: '#b5651d',
  borderColor: '#2b2118',
  glyphColor: '#ffffff',
  scale: 1.3,
} as const;

/**
 * Imperative owner of the map's cafe markers, deliberately outside React.
 * The Google Maps marker API is mutation-based (`marker.map = null`,
 * `marker.content = …`); keeping every one of those writes inside this class
 * means `CafeMap` only ever *calls methods*, so the component stays a clean
 * "props in → render out" surface with no in-effect mutation.
 *
 * One `AdvancedMarkerElement` per `placeId`; markers dropped from the result
 * set are removed with their listeners; repeated syncs never duplicate a
 * marker.
 */
export class MarkerLayer {
  private readonly markers = new Map<string, TrackedMarker>();

  constructor(
    private readonly map: google.maps.Map,
    private readonly lib: MarkerLibrary,
    private readonly onSelect: (placeId: string) => void,
  ) {}

  sync(cafes: Cafe[]): void {
    const nextIds = new Set(cafes.map((cafe) => cafe.placeId));

    for (const [placeId, tracked] of this.markers) {
      if (!nextIds.has(placeId)) {
        this.detach(tracked);
        this.markers.delete(placeId);
      }
    }

    for (const cafe of cafes) {
      const position = { lat: cafe.location.latitude, lng: cafe.location.longitude };
      const existing = this.markers.get(cafe.placeId);
      if (existing) {
        existing.marker.position = position;
        continue;
      }
      const marker = new this.lib.AdvancedMarkerElement({
        map: this.map,
        position,
        title: cafe.name,
        gmpClickable: true,
      });
      const handler = () => this.onSelect(cafe.placeId);
      marker.addEventListener('gmp-click', handler);
      this.markers.set(cafe.placeId, { marker, handler });
    }
  }

  setSelected(selectedPlaceId: string | null, cafes: Cafe[]): void {
    const byId = new Map(cafes.map((cafe) => [cafe.placeId, cafe]));
    for (const [placeId, tracked] of this.markers) {
      const isSelected = placeId === selectedPlaceId;
      tracked.marker.content = isSelected ? new this.lib.PinElement(SELECTED_PIN).element : null;
      tracked.marker.zIndex = isSelected ? 1 : null;

      const cafe = byId.get(placeId);
      if (isSelected && cafe) {
        this.map.panTo({ lat: cafe.location.latitude, lng: cafe.location.longitude });
      }
    }
  }

  destroy(): void {
    for (const tracked of this.markers.values()) {
      this.detach(tracked);
    }
    this.markers.clear();
  }

  /** Test/introspection helper: current marker count. */
  get size(): number {
    return this.markers.size;
  }

  private detach(tracked: TrackedMarker): void {
    tracked.marker.removeEventListener('gmp-click', tracked.handler);
    tracked.marker.map = null;
  }
}
