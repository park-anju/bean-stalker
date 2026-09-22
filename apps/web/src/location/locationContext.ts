import { createContext } from 'react';
import type { UseLocationResult } from './useLocation.js';

export const LocationContext = createContext<UseLocationResult | null>(null);
