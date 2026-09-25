import type { Cafe, LatLng, SearchCenter } from '@bean-stalker/contracts';

export type CafeMarkerData = {
  id: string;
  title: string;
  coordinate: LatLng;
};

function isValidCoordinate(value: LatLng): boolean {
  return (
    Number.isFinite(value.latitude) &&
    Number.isFinite(value.longitude) &&
    value.latitude >= -90 &&
    value.latitude <= 90 &&
    value.longitude >= -180 &&
    value.longitude <= 180
  );
}

export function getCafeMarkerData(cafes: Cafe[]): CafeMarkerData[] {
  return cafes
    .filter((cafe) => isValidCoordinate(cafe.location))
    .map((cafe) => ({
      id: cafe.placeId,
      title: cafe.name,
      coordinate: cafe.location,
    }));
}

export function getMapCoordinates(center: SearchCenter, cafes: Cafe[]): LatLng[] {
  return [center, ...getCafeMarkerData(cafes).map((marker) => marker.coordinate)];
}
