/**
 * Sliding Window Client & Action Rate Limiter for GramMitra
 */

const LOCAL_STORAGE_KEY = "grammitra-rate-limits";

function loadTrackers(): Record<string, number[]> {
  if (typeof window === "undefined") return {};
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!saved) return {};
  try {
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

function saveTrackers(trackers: Record<string, number[]>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trackers));
  } catch (e) {
    console.error(e);
  }
}

export interface RateLimitConfig {
  maxRequests: number; // e.g. 5
  windowMs: number; // e.g. 300,000ms (5 minutes)
}

export const DEFAULT_POST_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 5 * 60 * 1000, // 5 minutes
};

export const DEFAULT_STORY_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
};

export const DEFAULT_VOTE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
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

  const trackers = loadTrackers();
  let timestamps = trackers[key] || [];

  // Remove timestamps outside the sliding window
  timestamps = timestamps.filter((time) => now - time < config.windowMs);

  if (timestamps.length >= config.maxRequests) {
    const oldest = timestamps[0];
    const waitSeconds = Math.ceil((config.windowMs - (now - oldest)) / 1000);
    return { allowed: false, waitSeconds: Math.max(1, waitSeconds) };
  }

  // Record action
  timestamps.push(now);
  trackers[key] = timestamps;
  saveTrackers(trackers);
  return { allowed: true };
}
