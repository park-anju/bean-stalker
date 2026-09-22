import { useContext } from 'react';
import { LocationContext } from './locationContext.js';
import type { UseLocationResult } from './useLocation.js';

export function useAppLocation(): UseLocationResult {
  const location = useContext(LocationContext);
  if (!location) throw new Error('useAppLocation must be used within LocationProvider');
  return location;
}
