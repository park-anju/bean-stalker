export type SearchLocation = {
  latitude: number;
  longitude: number;
};

export type ForegroundPermission = {
  status: 'granted' | 'denied' | 'undetermined';
  canAskAgain: boolean;
};

export interface LocationAdapter {
  getForegroundPermission(): Promise<ForegroundPermission>;
  requestForegroundPermission(): Promise<ForegroundPermission>;
  hasServicesEnabled(): Promise<boolean>;
  requestServicesEnablement(): Promise<void>;
  getCurrentPosition(): Promise<SearchLocation>;
}

export function isValidSearchLocation(value: SearchLocation): boolean {
  return (
    Number.isFinite(value.latitude) &&
    Number.isFinite(value.longitude) &&
    value.latitude >= -90 &&
    value.latitude <= 90 &&
    value.longitude >= -180 &&
    value.longitude <= 180
  );
}
