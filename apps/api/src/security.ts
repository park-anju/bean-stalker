import type { FastifyInstance } from 'fastify';

/**
 * Backend security hardening (H07 / [[ADR-009 API Security Posture]]).
 *
 * Bean Stalker's API is a small JSON service with **no accounts, no cookies,
 * no mutation endpoints** (favourites are browser-local). The hardening here
 * matches that threat model — no auth, no sessions, no CSRF machinery.
 */

/** Maximum accepted request body. The only body is the ~150-byte search request. */
export const REQUEST_BODY_LIMIT_BYTES = 16 * 1024;

/**
 * Whole-request timeout. Comfortably above the default 10 s outbound provider
 * timeout + processing, so a legitimate search always completes, while a client
 * that opens a connection and dribbles (or never finishes) its body is dropped
 * rather than holding a worker. HTTPS/HSTS and connection-level tuning are
 * deployment concerns (BLK-003).
 */
export const REQUEST_TIMEOUT_MS = 20_000;

/**
 * Response headers applied to every reply. Each earns its place for a JSON API:
 *   - `X-Content-Type-Options: nosniff` — a browser must not MIME-sniff a JSON
 *     error body into HTML/JS.
 *   - `Referrer-Policy: no-referrer` — API responses should leak no referrer.
 *   - `X-Frame-Options: DENY` — the JSON must never be framed.
 *
 * Deliberately NOT set: `Content-Security-Policy` (page directive, no effect on
 * a JSON API), `Strict-Transport-Security` (needs the deployment's HTTPS story
 * — BLK-003), `Permissions-Policy` / `Cross-Origin-Opener-Policy` /
 * `Cross-Origin-Resource-Policy` (add nothing over the strict single-origin
 * CORS already in place, and CORP risks confusing legitimate cross-origin
 * fetches from the web client).
 */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
};

export function registerSecurity(app: FastifyInstance): void {
  app.addHook('onSend', async (_request, reply) => {
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      reply.header(name, value);
    }
  });

  // An unknown route or an unsupported method on a known path returns the
  // canonical Bean Stalker envelope — not Fastify's default shape, which would
  // echo the route pattern.
  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
        requestId: request.id,
      },
    });
  });
}
