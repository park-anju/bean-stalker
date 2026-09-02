import { describe, expect, it } from 'vitest';
import {
  InMemoryProviderUsageGuard,
  UnlimitedProviderUsageGuard,
  utcMonthKey,
} from './providerUsageGuard.js';

function clockAt(iso: string) {
  const state = { d: new Date(iso) };
  return {
    now: () => state.d,
    set: (next: string) => {
      state.d = new Date(next);
    },
  };
}

describe('utcMonthKey', () => {
  it('produces a zero-padded UTC YYYY-MM key', () => {
    expect(utcMonthKey(new Date('2026-01-05T23:00:00Z'))).toBe('2026-01');
    expect(utcMonthKey(new Date('2026-12-31T23:59:59Z'))).toBe('2026-12');
  });
});

describe('UnlimitedProviderUsageGuard', () => {
  it('always allows and reports no limit', async () => {
    const guard = new UnlimitedProviderUsageGuard();
    for (let i = 0; i < 100; i += 1) {
      expect((await guard.tryConsume()).allowed).toBe(true);
    }
    const status = await guard.getStatus();
    expect(status.limit).toBeNull();
    expect(status.remaining).toBeNull();
  });
});

describe('InMemoryProviderUsageGuard', () => {
  it('allows exactly `limit` attempts per period, then denies', async () => {
    const guard = new InMemoryProviderUsageGuard(3, clockAt('2026-03-10T00:00:00Z').now);

    expect((await guard.tryConsume()).allowed).toBe(true);
    expect((await guard.tryConsume()).allowed).toBe(true);
    const third = await guard.tryConsume();
    expect(third.allowed).toBe(true);
    expect(third.remaining).toBe(0);

    expect((await guard.tryConsume()).allowed).toBe(false);
    expect((await guard.getStatus()).used).toBe(3);
  });

  it('does not refund a consumed unit when the caller reports a provider failure', async () => {
    // The guard has no failure API by design — a consumed unit stays consumed.
    const guard = new InMemoryProviderUsageGuard(2, clockAt('2026-03-10T00:00:00Z').now);
    await guard.tryConsume(); // caller: provider then threw
    await guard.tryConsume(); // caller: provider then timed out
    expect((await guard.tryConsume()).allowed).toBe(false);
  });

  it('resets the allowance on a UTC month rollover', async () => {
    const clock = clockAt('2026-03-31T23:00:00Z');
    const guard = new InMemoryProviderUsageGuard(2, clock.now);

    await guard.tryConsume();
    await guard.tryConsume();
    expect((await guard.tryConsume()).allowed).toBe(false);

    clock.set('2026-04-01T00:30:00Z');
    const afterRollover = await guard.tryConsume();
    expect(afterRollover.allowed).toBe(true);
    expect(afterRollover.periodKey).toBe('2026-04');
    expect((await guard.getStatus()).used).toBe(1);
  });

  it('rejects a negative or non-integer limit', () => {
    expect(() => new InMemoryProviderUsageGuard(-1)).toThrow();
    expect(() => new InMemoryProviderUsageGuard(1.5)).toThrow();
  });

  it('a limit of 0 denies every attempt (deliberate fully fail-closed value)', async () => {
    const guard = new InMemoryProviderUsageGuard(0, clockAt('2026-03-10T00:00:00Z').now);
    expect((await guard.tryConsume()).allowed).toBe(false);
  });

  it('under concurrent tryConsume, accepted count never exceeds the limit', async () => {
    const guard = new InMemoryProviderUsageGuard(10, clockAt('2026-03-10T00:00:00Z').now);
    const decisions = await Promise.all(Array.from({ length: 40 }, () => guard.tryConsume()));
    expect(decisions.filter((d) => d.allowed)).toHaveLength(10);
    expect((await guard.getStatus()).used).toBe(10);
  });
});
