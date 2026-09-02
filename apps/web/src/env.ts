import { z } from 'zod';
import { formatValidationError, HttpOriginSchema } from '@bean-stalker/contracts';

const ClientEnvSchema = z.object({
  // The API origin the client prefixes onto `/api/v1/...` — a bare http/https
  // origin, trailing slash tolerated, no path/query (H06).
  VITE_API_BASE_URL: HttpOriginSchema,
  // Browser-visible by design (H06 / ADR-009): the Maps JavaScript key and Map
  // ID ship in the bundle; they are protected Google-side (referrer + API
  // restrictions), not by being hidden. They are NOT secrets.
  VITE_GOOGLE_MAPS_BROWSER_KEY: z.string().min(1),
  VITE_GOOGLE_MAPS_MAP_ID: z.string().min(1),
});

export interface ClientEnv {
  apiBaseUrl: string;
  googleMapsBrowserKey: string;
  googleMapsMapId: string;
}

export function loadClientEnv(
  raw: Record<string, string | undefined> = import.meta.env,
): ClientEnv {
  const result = ClientEnvSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(formatValidationError('Browser environment', result.error));
  }

  const env = result.data;
  return {
    apiBaseUrl: env.VITE_API_BASE_URL,
    googleMapsBrowserKey: env.VITE_GOOGLE_MAPS_BROWSER_KEY,
    googleMapsMapId: env.VITE_GOOGLE_MAPS_MAP_ID,
  };
}

export const clientEnv = loadClientEnv();
