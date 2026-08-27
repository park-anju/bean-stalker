import { buildApp } from './app.js';
import { loadServerEnv } from './env.js';
import type { CafeProvider } from './providers/cafeProvider.js';
import { GooglePlacesProvider } from './providers/google-places/googlePlacesProvider.js';
import { FixtureCafeProvider } from './providers/fixtureCafeProvider.js';

const env = loadServerEnv();
const cafeProvider: CafeProvider =
  env.cafeProvider === 'fixture'
    ? new FixtureCafeProvider()
    : new GooglePlacesProvider({
        apiKey: env.googlePlacesServerKey,
        timeoutMs: env.googlePlacesTimeoutMs,
      });
const app = await buildApp({ webOrigin: env.webOrigin, cafeProvider });

async function shutdown(signal: NodeJS.Signals) {
  app.log.info({ signal }, 'shutting down');
  await app.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await app.listen({ port: env.port, host: '0.0.0.0' });
