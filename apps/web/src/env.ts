import { z } from 'zod';
import { formatValidationError } from '@bean-stalker/contracts';

const ClientEnvSchema = z.object({
  VITE_API_BASE_URL: z.url(),
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
