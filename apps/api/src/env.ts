export interface ServerEnv {
  port: number;
  webOrigin: string;
}

export function loadServerEnv(env: NodeJS.ProcessEnv = process.env): ServerEnv {
  return {
    port: Number(env.PORT ?? 3001),
    webOrigin: env.WEB_ORIGIN ?? 'http://localhost:5173',
  };
}
