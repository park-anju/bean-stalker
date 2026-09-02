import { describe, expect, it } from 'vitest';
import { HttpOriginSchema } from './env.js';

describe('HttpOriginSchema', () => {
  it('accepts a bare http/https origin', () => {
    expect(HttpOriginSchema.parse('http://localhost:5173')).toBe('http://localhost:5173');
    expect(HttpOriginSchema.parse('https://beanstalker.example')).toBe(
      'https://beanstalker.example',
    );
  });

  it('strips a single trailing slash so the two forms are equivalent', () => {
    expect(HttpOriginSchema.parse('http://localhost:3001/')).toBe('http://localhost:3001');
  });

  it('rejects a path, query or fragment', () => {
    expect(HttpOriginSchema.safeParse('http://localhost:3001/api').success).toBe(false);
    expect(HttpOriginSchema.safeParse('http://localhost:3001?x=1').success).toBe(false);
    expect(HttpOriginSchema.safeParse('http://localhost:3001/#/foo').success).toBe(false);
  });

  it('rejects a non-http scheme and a non-URL', () => {
    expect(HttpOriginSchema.safeParse('ftp://localhost').success).toBe(false);
    expect(HttpOriginSchema.safeParse('javascript:alert(1)').success).toBe(false);
    expect(HttpOriginSchema.safeParse('not a url').success).toBe(false);
    expect(HttpOriginSchema.safeParse('localhost:3001').success).toBe(false);
  });
});
