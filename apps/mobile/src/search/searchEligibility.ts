import type { SearchCenter } from '@bean-stalker/contracts';
import type { LocationState } from '@/location/locationState';

/** Only a currently verified location may reach the provider-backed query. */
export function readySearchCenter(state: LocationState): SearchCenter | undefined {
  return state.status === 'ready'
    ? { latitude: state.location.latitude, longitude: state.location.longitude }
    : undefined;
}
