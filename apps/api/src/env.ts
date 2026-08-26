import { z } from 'zod';
import { formatValidationError } from '@bean-stalker/contracts';

const ServerEnvSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535),
  WEB_ORIGIN: z.url(),
  GOOGLE_PLACES_SERVER_KEY: z.string().min(1),
  GOOGLE_PLACES_TIMEOUT_MS: z.coerce.number().int().positive(),
});

export interface ServerEnv {
  port: number;
  webOrigin: string;
  googlePlacesServerKey: string;
  googlePlacesTimeoutMs: number;
}

export function loadServerEnv(raw: NodeJS.ProcessEnv = process.env): ServerEnv {
  const result = ServerEnvSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(formatValidationError('Server environment', result.error));
  }

  const env = result.data;
  return {
    port: env.PORT,
    webOrigin: env.WEB_ORIGIN,
    googlePlacesServerKey: env.GOOGLE_PLACES_SERVER_KEY,
    googlePlacesTimeoutMs: env.GOOGLE_PLACES_TIMEOUT_MS,
  };
}
