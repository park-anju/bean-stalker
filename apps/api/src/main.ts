import { buildApp } from './app.js';
import { loadServerEnv } from './env.js';
import { buildLoggerOptions } from './logging.js';
import { FixedWindowRateLimiter } from './rateLimiter.js';
import {
  InMemoryProviderUsageGuard,
  UnlimitedProviderUsageGuard,
  type ProviderUsageGuard,
} from './providerUsageGuard.js';
import type { CafeProvider } from './providers/cafeProvider.js';
import { GooglePlacesProvider } from './providers/google-places/googlePlacesProvider.js';
import { FixtureCafeProvider } from './providers/fixtureCafeProvider.js';

const env = loadServerEnv();

// Fixture mode needs no Google credential and no metered-provider cap.
// Live mode requires both — env validation enforces it; these guards are a
// belt-and-braces narrowing for the type checker (ADR-009 fail-closed config).
let cafeProvider: CafeProvider;
let usageGuard: ProviderUsageGuard;
if (env.cafeProvider === 'live') {
  if (env.googlePlacesServerKey === undefined) {
    throw new Error('GOOGLE_PLACES_SERVER_KEY is required when CAFE_PROVIDER=live');
  }
  if (env.providerMonthlyRequestLimit === undefined) {
    throw new Error('PROVIDER_MONTHLY_REQUEST_LIMIT is required when CAFE_PROVIDER=live');
  }
  cafeProvider = new GooglePlacesProvider({
    apiKey: env.googlePlacesServerKey,
    timeoutMs: env.googlePlacesTimeoutMs,
  });
  // The in-memory guard is NOT a production financial hard cap — see ADR-008.
  usageGuard = new InMemoryProviderUsageGuard(env.providerMonthlyRequestLimit);
} else {
  cafeProvider = new FixtureCafeProvider();
  usageGuard = new UnlimitedProviderUsageGuard();
}

const searchRateLimiter = new FixedWindowRateLimiter({
  max: env.searchRateLimitMax,
  windowMs: env.searchRateLimitWindowMs,
});

const app = await buildApp({
  webOrigin: env.webOrigin,
  cafeProvider,
  usageGuard,
  searchRateLimiter,
  logger: buildLoggerOptions(env.logLevel),
});

async function shutdown(signal: NodeJS.Signals) {
  app.log.info({ signal }, 'shutting down');
  await app.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await app.listen({ port: env.port, host: '0.0.0.0' });
