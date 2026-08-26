import { buildApp } from './app.js';
import { loadServerEnv } from './env.js';

const env = loadServerEnv();
const app = await buildApp(env.webOrigin);

async function shutdown(signal: NodeJS.Signals) {
  app.log.info({ signal }, 'shutting down');
  await app.close();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await app.listen({ port: env.port, host: '0.0.0.0' });
