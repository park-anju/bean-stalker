// Concrete shape so callers can spread it (e.g. tests adding a capture stream).
export interface PrivacySafeLoggerOptions {
  level: LogLevel;
  redact: { paths: string[]; remove: true };
  serializers: {
    req: (request: { method?: string; url?: string }) => {
      method: string | undefined;
      url: string | undefined;
    };
    res: (reply: { statusCode?: number }) => { statusCode: number | undefined };
    err: (error: unknown) => SerializedError;
  };
}

/**
 * Privacy-safe structured logging policy (H02).
 *
 * The cafe-search request body carries a precise `SearchCenter`, and provider
 * calls carry `X-Goog-Api-Key`. Neither must ever reach an application log
 * ([[Privacy Boundaries]], [[Observability Runbook]], [[Pre-T08 Project Checkpoint]]).
 *
 * What we deliberately keep for observability: request id (Fastify adds it as
 * `reqId`), method, path, status code, response time, and bounded application
 * error codes (the route logs `{ providerErrorCode }`, not the message).
 *
 * What this configuration removes vs. Fastify's defaults:
 *   - `req.remoteAddress` / `req.remotePort` — the client IP is never logged
 *     (H02 / H03). It is used only as an ephemeral in-memory rate-limit key.
 *   - `req.hostname` and request headers — not logged.
 *   - any query string on the URL — stripped, so a coordinate can never ride
 *     in via the path even if a future route adds query params.
 *   - error own-properties other than `type` / `message` / `stack` — so an
 *     error that happens to carry an attached `.response` / `.body` / `.config`
 *     cannot leak a raw provider payload or credential through serialization.
 */
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';

interface SerializedError {
  type: string;
  message: string;
  stack: string;
  [key: string]: unknown;
}

function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return { type: error.name, message: error.message, stack: error.stack ?? '' };
  }
  return { type: 'NonError', message: String(error), stack: '' };
}

function serializeRequest(request: { method?: string; url?: string }): {
  method: string | undefined;
  url: string | undefined;
} {
  const rawUrl = request.url;
  const url = typeof rawUrl === 'string' ? (rawUrl.split('?')[0] ?? rawUrl) : rawUrl;
  return { method: request.method, url };
}

function serializeReply(reply: { statusCode?: number }): { statusCode: number | undefined } {
  return { statusCode: reply.statusCode };
}

export function buildLoggerOptions(level: LogLevel = 'info'): PrivacySafeLoggerOptions {
  return {
    level,
    // Defence in depth: even though the serializers never emit these, redact
    // any credential- or coordinate-shaped path if a future
    // `request.log.info({ ... })` call passes one through.
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.headers["x-goog-api-key"]',
        'req.headers["x-goog-fieldmask"]',
        'headers.authorization',
        'headers.cookie',
        'req.body',
        'body',
        'center',
        'searchCenter',
        'latitude',
        'longitude',
        'apiKey',
        'googlePlacesServerKey',
      ],
      remove: true,
    },
    serializers: {
      req: serializeRequest,
      res: serializeReply,
      err: serializeError,
    },
  };
}
