/**
 * Global metered-provider usage guard (H04).
 *
 * Prevents Bean Stalker as a whole from dispatching more metered provider
 * attempts in an operational period than an explicitly configured allowance —
 * the case where many clients, each within their personal rate limit, could
 * still collectively exhaust the provider allowance.
 *
 * Accounting semantics ([[ADR-008 Metered Provider Cost Controls]]):
 *   - one allowance unit is consumed immediately *before* a real provider
 *     attempt is dispatched;
 *   - the unit is NOT refunded if the provider then errors, times out, or
 *     returns a malformed response — an outbound attempt is assumed to
 *     contribute to billable/operational usage unless proven otherwise;
 *   - requests rejected earlier (validation, per-client rate limit) never
 *     consume, and a guard rejection means the provider is never called.
 *
 * The in-memory implementation is test/development infrastructure only. It
 * resets on process restart and is not shared across instances, so it is NOT a
 * production financial hard cap — see ADR-008 and [[Known Blockers|BLK-004]].
 */
export interface UsageDecision {
  allowed: boolean;
  periodKey: string;
  /** Remaining units after this decision (`null` for an unlimited guard). */
  remaining: number | null;
}

export interface UsageStatus {
  periodKey: string;
  /** Configured allowance for the period (`null` for an unlimited guard). */
  limit: number | null;
  used: number;
  remaining: number | null;
}

export interface ProviderUsageGuard {
  /**
   * Atomically checks the current period's allowance and, if room remains,
   * consumes exactly one unit. Concurrent callers must never collectively
   * consume more than the configured limit.
   */
  tryConsume(): Promise<UsageDecision>;
  getStatus(): Promise<UsageStatus>;
}

/** UTC `YYYY-MM` period key. Operational periods are UTC (Pre-T08 Checkpoint §6). */
export function utcMonthKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Always allows and consumes nothing. Used for `CAFE_PROVIDER=fixture` so
 * ordinary local development is never blocked by a simulated monthly cap —
 * fixture requests do not cost money.
 */
export class UnlimitedProviderUsageGuard implements ProviderUsageGuard {
  async tryConsume(): Promise<UsageDecision> {
    return { allowed: true, periodKey: 'unlimited', remaining: null };
  }

  async getStatus(): Promise<UsageStatus> {
    return { periodKey: 'unlimited', limit: null, used: 0, remaining: null };
  }
}

/**
 * In-memory monthly attempt cap. Deterministic and injectable-clock for tests;
 * NOT a production hard cap (see the file header).
 */
export class InMemoryProviderUsageGuard implements ProviderUsageGuard {
  private periodKey: string;
  private used = 0;

  constructor(
    private readonly limit: number,
    private readonly now: () => Date = () => new Date(),
  ) {
    if (!Number.isInteger(limit) || limit < 0) {
      throw new Error(
        `PROVIDER_MONTHLY_REQUEST_LIMIT must be a non-negative integer, got ${String(limit)}`,
      );
    }
    this.periodKey = utcMonthKey(this.now());
  }

  async tryConsume(): Promise<UsageDecision> {
    // The check + increment below run to completion in one synchronous step
    // (no `await` between them), so `used` can never exceed `limit` even under
    // Promise.all concurrency. A durable/shared implementation MUST perform
    // this as a single atomic store operation.
    const periodKey = this.rollToCurrentPeriod();
    if (this.used >= this.limit) {
      return { allowed: false, periodKey, remaining: 0 };
    }
    this.used += 1;
    return { allowed: true, periodKey, remaining: this.limit - this.used };
  }

  async getStatus(): Promise<UsageStatus> {
    const periodKey = this.rollToCurrentPeriod();
    return {
      periodKey,
      limit: this.limit,
      used: this.used,
      remaining: Math.max(0, this.limit - this.used),
    };
  }

  private rollToCurrentPeriod(): string {
    const periodKey = utcMonthKey(this.now());
    if (periodKey !== this.periodKey) {
      this.periodKey = periodKey;
      this.used = 0;
    }
    return periodKey;
  }
}
