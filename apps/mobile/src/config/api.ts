import { z } from 'zod';

const ApiBaseUrlSchema = z.string().url().refine((value) => {
  try {
    const url = new URL(value);
    return url.pathname === '/' && url.search === '' && url.hash === '';
  } catch {
    return false;
  }
}, 'must be a bare HTTP(S) origin');

export function loadMobileApiConfig(
  raw: string | undefined,
  isDevelopment: boolean,
): { apiBaseUrl: string } {
  const configured = raw?.replace(/\/$/, '');
  if (configured) {
    const parsed = ApiBaseUrlSchema.safeParse(configured);
    if (!parsed.success) throw new Error('Invalid mobile API base URL configuration.');
    if (!isDevelopment && !configured.startsWith('https://')) {
      throw new Error('Production mobile API base URL must use HTTPS.');
    }
    return { apiBaseUrl: configured };
  }

  if (isDevelopment) return { apiBaseUrl: 'http://127.0.0.1:3001' };
  throw new Error('Production mobile API base URL is not configured.');
}

export const mobileApiConfig = loadMobileApiConfig(
  process.env.EXPO_PUBLIC_API_BASE_URL,
  typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production',
);
