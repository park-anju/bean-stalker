import { describe, expect, it } from 'vitest';
import { FixedWindowRateLimiter } from './rateLimiter.js';

function fixedClock(start = 0) {
  const state = { t: start };
  return {
    now: () => state.t,
    advance: (ms: number) => {
      state.t += ms;
    },
  };
}

describe('FixedWindowRateLimiter', () => {
  it('allows up to max requests in a window, then denies with a Retry-After', () => {
    const clock = fixedClock();
    const limiter = new FixedWindowRateLimiter({ max: 3, windowMs: 60_000 }, clock.now);

    expect(limiter.tryConsume('a').allowed).toBe(true);
    expect(limiter.tryConsume('a').allowed).toBe(true);
    expect(limiter.tryConsume('a').allowed).toBe(true);

    const denied = limiter.tryConsume('a');
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterSeconds).toBe(60);
  });

  it('tracks each client key independently', () => {
    const limiter = new FixedWindowRateLimiter({ max: 1, windowMs: 60_000 }, () => 0);
    expect(limiter.tryConsume('a').allowed).toBe(true);
    expect(limiter.tryConsume('a').allowed).toBe(false);
    expect(limiter.tryConsume('b').allowed).toBe(true);
  });

  it('resets a client once its window elapses', () => {
    const clock = fixedClock();
    const limiter = new FixedWindowRateLimiter({ max: 2, windowMs: 60_000 }, clock.now);

    limiter.tryConsume('a');
    limiter.tryConsume('a');
    expect(limiter.tryConsume('a').allowed).toBe(false);

    clock.advance(60_000);
    expect(limiter.tryConsume('a').allowed).toBe(true);
  });

  it('shrinks Retry-After as the window elapses, never below 1s', () => {
    const clock = fixedClock();
    const limiter = new FixedWindowRateLimiter({ max: 1, windowMs: 10_000 }, clock.now);
    limiter.tryConsume('a');

    clock.advance(3_000);
    expect(limiter.tryConsume('a').retryAfterSeconds).toBe(7);
    clock.advance(6_500);
    expect(limiter.tryConsume('a').retryAfterSeconds).toBe(1);
  });

  it('rejects a nonsensical configuration', () => {
    expect(() => new FixedWindowRateLimiter({ max: 0, windowMs: 60_000 })).toThrow();
    expect(() => new FixedWindowRateLimiter({ max: 5, windowMs: 0 })).toThrow();
  });

  it('under Promise.all-style concurrency, admits no more than max per window', async () => {
    const limiter = new FixedWindowRateLimiter({ max: 10, windowMs: 60_000 }, () => 0);
    const results = await Promise.all(
      Array.from({ length: 50 }, () => Promise.resolve(limiter.tryConsume('a'))),
    );
    expect(results.filter((r) => r.allowed)).toHaveLength(10);
  });
});
