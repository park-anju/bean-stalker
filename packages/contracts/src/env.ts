import { z } from 'zod';

/**
 * A browser/API **origin**: `scheme://host[:port]` with an `http`/`https`
 * scheme and no path, query or fragment. Used for `WEB_ORIGIN` (API CORS) and
 * `VITE_API_BASE_URL` (the base the web client prefixes onto `/api/v1/...`).
 *
 * A lone trailing `/` is tolerated and stripped so `http://localhost:3001` and
 * `http://localhost:3001/` behave identically; anything more (a path segment,
 * `?query`, `#fragment`, a non-http scheme, a scheme-less host) fails
 * validation rather than silently propagating.
 *
 * Implemented without the `URL` global so this stays usable in every
 * TypeScript `lib` target (contracts is consumed by both apps).
 */
const ORIGIN_PATTERN = /^https?:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::\d{1,5})?$/i;

export const HttpOriginSchema = z
  .string()
  .trim()
  .transform((value) => (value.endsWith('/') ? value.slice(0, -1) : value))
  .refine((value) => ORIGIN_PATTERN.test(value), {
    message: 'must be a bare http(s) origin (scheme://host[:port], no path/query/fragment)',
  });
