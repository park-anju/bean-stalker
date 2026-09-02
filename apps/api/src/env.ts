import { z } from 'zod';
import { formatValidationError, HttpOriginSchema } from '@bean-stalker/contracts';
import type { LogLevel } from './logging.js';

const ServerEnvSchema = z
  .object({
    PORT: z.coerce.number().int().min(1).max(65535),
    // API CORS allow-origin: a bare http/https origin, no path/query (H06/H07).
    WEB_ORIGIN: HttpOriginSchema,
    // Server-only Google Places secret. OPTIONAL at the schema level so
    // fixture mode needs no credential; REQUIRED when CAFE_PROVIDER=live
    // (refined below). Never exposed to the browser (ADR-005 / ADR-009).
    GOOGLE_PLACES_SERVER_KEY: z.string().min(1).optional(),
    // Outbound provider timeout. Bounded so an absurd value cannot hold a
    // request open; defaulted so fixture mode is easy.
    GOOGLE_PLACES_TIMEOUT_MS: z.coerce.number().int().min(100).max(30_000).default(10_000),
    // Selects the cafe-search provider. `fixture` (dev/test only) serves
    // committed fixtures with no billable Google traffic.
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
    if (env.CAFE_PROVIDER !== 'live') return;
    if (env.GOOGLE_PLACES_SERVER_KEY === undefined) {
      ctx.addIssue({
        code: 'custom',
        path: ['GOOGLE_PLACES_SERVER_KEY'],
        message: 'is required when CAFE_PROVIDER=live',
      });
    }
    if (env.PROVIDER_MONTHLY_REQUEST_LIMIT === undefined) {
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
  /** Present whenever `cafeProvider === 'live'` (enforced by env validation). */
  googlePlacesServerKey: string | undefined;
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
    // `formatValidationError` prints field name + issue message only, never
    // the offending value — a bad secret is never echoed (H06 / ADR-009).
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
