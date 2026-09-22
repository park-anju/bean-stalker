import * as Location from 'expo-location';
import { Platform } from 'react-native';

import {
  ForegroundPermission,
  LocationAdapter,
  SearchLocation,
  isValidSearchLocation,
} from './locationTypes';

function toForegroundPermission(
  response: Location.LocationPermissionResponse,
): ForegroundPermission {
  if (response.status === Location.PermissionStatus.GRANTED) {
    return { status: 'granted', canAskAgain: response.canAskAgain };
  }

  if (response.status === Location.PermissionStatus.UNDETERMINED) {
    return { status: 'undetermined', canAskAgain: response.canAskAgain };
  }

  return { status: 'denied', canAskAgain: response.canAskAgain };
}

export const expoLocationAdapter: LocationAdapter = {
  async getForegroundPermission() {
    return toForegroundPermission(await Location.getForegroundPermissionsAsync());
  },

  async requestForegroundPermission() {
    return toForegroundPermission(await Location.requestForegroundPermissionsAsync());
  },

  hasServicesEnabled() {
    return Location.hasServicesEnabledAsync();
  },

  requestServicesEnablement() {
    if (Platform.OS !== 'android') {
      return Promise.reject(new Error('LOCATION_SERVICES_ENABLEMENT_UNSUPPORTED'));
    }

    return Location.enableNetworkProviderAsync();
  },

  async getCurrentPosition() {
    const result = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const location = {
      latitude: result.coords.latitude,
      longitude: result.coords.longitude,
    } satisfies SearchLocation;

    if (!isValidSearchLocation(location)) {
      throw new Error('LOCATION_INVALID');
    }

    return location;
  },
};
