import type { LatLng } from '@bean-stalker/contracts';
import type { Region } from 'react-native-maps';

const MINIMUM_DELTA = 0.01;

export function buildInitialMapRegion(coordinates: LatLng[]): Region {
  const safeCoordinates = coordinates.length > 0 ? coordinates : [{ latitude: 0, longitude: 0 }];
  const latitudes = safeCoordinates.map((coordinate) => coordinate.latitude);
  const longitudes = safeCoordinates.map((coordinate) => coordinate.longitude);
  const latitudeSpan = Math.max(MINIMUM_DELTA, (Math.max(...latitudes) - Math.min(...latitudes)) * 1.5);
  const longitudeSpan = Math.max(MINIMUM_DELTA, (Math.max(...longitudes) - Math.min(...longitudes)) * 1.5);

  return {
    latitude: (Math.max(...latitudes) + Math.min(...latitudes)) / 2,
    longitude: (Math.max(...longitudes) + Math.min(...longitudes)) / 2,
    latitudeDelta: latitudeSpan,
    longitudeDelta: longitudeSpan,
  };
}
