import type { ReactNode } from 'react';
import type { SearchCenter } from '@bean-stalker/contracts';
import type { GeolocationAdapter } from './browserGeolocation.js';
import { LocationContext } from './locationContext.js';
import { useLocation } from './useLocation.js';

export interface LocationProviderProps {
  children: ReactNode;
  adapter?: GeolocationAdapter;
  initialCenter?: SearchCenter;
}

/**
 * Keeps the transient search location alive for this application session while
 * leaving platform acquisition inside an injected adapter. Nothing here
 * persists coordinates or couples cafe discovery to browser APIs.
 */
export function LocationProvider({ children, adapter, initialCenter }: LocationProviderProps) {
  const location = useLocation(adapter, initialCenter);
  return <LocationContext.Provider value={location}>{children}</LocationContext.Provider>;
}
