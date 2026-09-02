/**
 * Per-client fixed-window rate limiter for the metered cafe-search route (H03).
 *
 * This protects against an individual client bursting requests. It is a
 * distinct control from the global {@link ProviderUsageGuard} (H04), which
 * caps aggregate provider consumption across all clients.
 *
 * Hand-rolled rather than `@fastify/rate-limit` (which is Fastify-5 compatible)
 * so the 429 response is exactly Bean Stalker's error envelope and the clock
 * is injectable for deterministic tests without real-time sleeps — see
 * [[ADR-008 Metered Provider Cost Controls]].
 *
 * The client key (typically the connection IP) is held only as an in-memory
 * Map key for the current window. It is never logged and never persisted.
 */
export interface RateLimitConfig {
  /** Max committed requests allowed per client per window. */
  max: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  /** Seconds until the client's window resets (0 when allowed). */
  retryAfterSeconds: number;
}

interface Window {
  count: number;
  startedAt: number;
}

/** Prune stale windows once the map exceeds this many keys. */
const PRUNE_THRESHOLD = 5_000;

export class FixedWindowRateLimiter {
  private readonly windows = new Map<string, Window>();

  constructor(
    private readonly config: RateLimitConfig,
    private readonly now: () => number = () => Date.now(),
  ) {
    if (!Number.isInteger(config.max) || config.max < 1) {
      throw new Error(`rate-limit max must be a positive integer, got ${config.max}`);
    }
    if (!Number.isInteger(config.windowMs) || config.windowMs < 1) {
      throw new Error(`rate-limit windowMs must be a positive integer, got ${config.windowMs}`);
    }
  }

  /**
   * Atomically checks and consumes one unit for `key`. Synchronous and
   * single-tick — no `await` between the check and the increment — so
   * concurrent calls cannot admit more than `max` per window.
   */
  tryConsume(key: string): RateLimitDecision {
    const at = this.now();
    const current = this.windows.get(key);

    if (!current || at - current.startedAt >= this.config.windowMs) {
      this.windows.set(key, { count: 1, startedAt: at });
      this.maybePrune(at);
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (current.count >= this.config.max) {
      const msLeft = current.startedAt + this.config.windowMs - at;
      return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(msLeft / 1000)) };
    }

    current.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  private maybePrune(at: number): void {
    if (this.windows.size < PRUNE_THRESHOLD) return;
    for (const [key, window] of this.windows) {
      if (at - window.startedAt >= this.config.windowMs) this.windows.delete(key);
    }
  }
}
