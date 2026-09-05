/**
 * Client-Side Rate Limiter & Action Throttling Engine — Wunabuy Staff Portal (OWASP A06/A07 Mitigation)
 * 
 * Prevents double-submissions, rapid clicking, and automated brute-force attacks on financial disbursals
 * and authentication attempts.
 */

import { securityLogger } from './securityLogger';

interface RateLimitTracker {
  count: number;
  firstAttemptTs: number;
  lockedUntilTs: number;
}

class RateLimiterService {
  private static instance: RateLimiterService;
  private trackers = new Map<string, RateLimitTracker>();

  private constructor() {}

  public static getInstance(): RateLimiterService {
    if (!RateLimiterService.instance) {
      RateLimiterService.instance = new RateLimiterService();
    }
    return RateLimiterService.instance;
  }

  /**
   * Check if an action is rate limited for a given key.
   * 
   * @param key Unique action identifier (e.g. `login:user@wunabuy.com` or `payout_approve:tr_901`)
   * @param maxAttempts Allowed attempts within window
   * @param windowMs Window duration in milliseconds (default 60,000ms = 1 min)
   * @param lockoutMs Lockout duration if limit exceeded (default 900,000ms = 15 mins)
   */
  public checkLimit(
    key: string,
    maxAttempts = 5,
    windowMs = 60000,
    lockoutMs = 900000
  ): { allowed: boolean; remainingAttempts: number; retryAfterSeconds: number } {
    const now = Date.now();
    let tracker = this.trackers.get(key);

    if (!tracker) {
      tracker = { count: 0, firstAttemptTs: now, lockedUntilTs: 0 };
      this.trackers.set(key, tracker);
    }

    // Check if currently locked out
    if (tracker.lockedUntilTs > now) {
      const secondsLeft = Math.ceil((tracker.lockedUntilTs - now) / 1000);
      return { allowed: false, remainingAttempts: 0, retryAfterSeconds: secondsLeft };
    }

    // Reset tracker if window expired
    if (now - tracker.firstAttemptTs > windowMs) {
      tracker.count = 0;
      tracker.firstAttemptTs = now;
      tracker.lockedUntilTs = 0;
    }

    tracker.count += 1;

    if (tracker.count > maxAttempts) {
      tracker.lockedUntilTs = now + lockoutMs;
      const secondsLeft = Math.ceil(lockoutMs / 1000);

      securityLogger.logEvent({
        action_code: 'RATE_LIMIT_EXCEEDED',
        action_description: `Rate limit of ${maxAttempts} attempts exceeded for action key '${key}'. Locked out for ${secondsLeft} seconds.`,
        security_level: 'CRITICAL',
        meta: { key, maxAttempts, lockoutSeconds: secondsLeft },
      });

      return { allowed: false, remainingAttempts: 0, retryAfterSeconds: secondsLeft };
    }

    const remaining = maxAttempts - tracker.count;
    return { allowed: true, remainingAttempts: remaining, retryAfterSeconds: 0 };
  }

  /**
   * Reset attempt tracker for a key (e.g. after successful login).
   */
  public reset(key: string): void {
    this.trackers.delete(key);
  }
}

export const rateLimiter = RateLimiterService.getInstance();
