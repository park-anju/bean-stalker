import { describe, expect, it } from 'vitest';

import { createCafeSearchQueryOptions } from './useCafeSearch';

describe('mobile cafe query semantics', () => {
  it('disables the query without a location and never auto-retries', () => {
    const options = createCafeSearchQueryOptions(undefined);
    expect(options.enabled).toBe(false);
    expect(options.retry).toBe(false);
  });

  it('uses a stable request-derived key and explicit-refresh-only settings', () => {
    const first = createCafeSearchQueryOptions({ latitude: 1, longitude: 2 });
    const second = createCafeSearchQueryOptions({ latitude: 1, longitude: 2 });
    expect(first.queryKey).toEqual(second.queryKey);
    expect(first.refetchOnMount).toBe(false);
    expect(first.refetchOnWindowFocus).toBe(false);
    expect(first.refetchOnReconnect).toBe(false);
  });
});
