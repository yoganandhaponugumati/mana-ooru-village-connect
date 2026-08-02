/**
 * Sliding Window Client & Action Rate Limiter for GramMitra
 */

interface RateLimitTracker {
  timestamps: number[];
}

const actionTrackers = new Map<string, RateLimitTracker>();

export interface RateLimitConfig {
  maxRequests: number; // e.g. 5
  windowMs: number; // e.g. 300,000ms (5 minutes)
}

export const DEFAULT_POST_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 5 * 60 * 1000, // 5 minutes
};

export const DEFAULT_STORY_LIMIT: RateLimitConfig = {
  maxRequests: 2,
  windowMs: 60 * 1000, // 1 minute
};

/**
 * Checks whether an action for a user exceeds the rate limit.
 * Returns true if allowed, false if rate limited.
 */
export function checkRateLimit(
  userId: string,
  actionKey: string,
  config: RateLimitConfig = DEFAULT_POST_LIMIT,
): { allowed: boolean; waitSeconds?: number } {
  const key = `${userId}:${actionKey}`;
  const now = Date.now();

  let tracker = actionTrackers.get(key);
  if (!tracker) {
    tracker = { timestamps: [] };
    actionTrackers.set(key, tracker);
  }

  // Remove timestamps outside the sliding window
  tracker.timestamps = tracker.timestamps.filter((time) => now - time < config.windowMs);

  if (tracker.timestamps.length >= config.maxRequests) {
    const oldest = tracker.timestamps[0];
    const waitSeconds = Math.ceil((config.windowMs - (now - oldest)) / 1000);
    return { allowed: false, waitSeconds: Math.max(1, waitSeconds) };
  }

  // Record action
  tracker.timestamps.push(now);
  return { allowed: true };
}
