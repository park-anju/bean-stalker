import { z } from 'zod';
import { formatValidationError } from '@bean-stalker/contracts';
import type { LogLevel } from './logging.js';

const ServerEnvSchema = z
  .object({
    PORT: z.coerce.number().int().min(1).max(65535),
    WEB_ORIGIN: z.url(),
    GOOGLE_PLACES_SERVER_KEY: z.string().min(1),
    GOOGLE_PLACES_TIMEOUT_MS: z.coerce.number().int().positive(),
    // Selects the cafe-search provider. `fixture` (dev/test only) serves
    // committed fixtures with no billable Google traffic — see
    // docs/13_OPERATIONS/Local Development Runbook.md.
    CAFE_PROVIDER: z.enum(['live', 'fixture']).default('live'),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    // H03 — per-client rate limit on POST /api/v1/cafes/search. Provisional
    // single-instance defaults; operational assumption, not product truth.
    SEARCH_RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(10),
    SEARCH_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(60_000),
    // H04 — global metered-provider monthly attempt cap. Optional here but
    // REQUIRED when CAFE_PROVIDER=live (refined below) so live mode cannot
    // accidentally inherit an unbounded default. `0` is a deliberate valid
    // value meaning "no live provider attempts this period".
    PROVIDER_MONTHLY_REQUEST_LIMIT: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((env, ctx) => {
    if (env.CAFE_PROVIDER === 'live' && env.PROVIDER_MONTHLY_REQUEST_LIMIT === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['PROVIDER_MONTHLY_REQUEST_LIMIT'],
        message: 'is required when CAFE_PROVIDER=live (global metered-provider usage guard)',
      });
    }
  });

export interface ServerEnv {
  port: number;
  webOrigin: string;
  googlePlacesServerKey: string;
  googlePlacesTimeoutMs: number;
  cafeProvider: 'live' | 'fixture';
  logLevel: LogLevel;
  searchRateLimitMax: number;
  searchRateLimitWindowMs: number;
  /** Present whenever `cafeProvider === 'live'` (enforced by env validation). */
  providerMonthlyRequestLimit: number | undefined;
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
    cafeProvider: env.CAFE_PROVIDER,
    logLevel: env.LOG_LEVEL,
    searchRateLimitMax: env.SEARCH_RATE_LIMIT_MAX,
    searchRateLimitWindowMs: env.SEARCH_RATE_LIMIT_WINDOW_MS,
    providerMonthlyRequestLimit: env.PROVIDER_MONTHLY_REQUEST_LIMIT,
  };
}
