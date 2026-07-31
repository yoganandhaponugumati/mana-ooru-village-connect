export type RateLimitType = 'listing' | 'complaint' | 'search';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const LIMITS: Record<RateLimitType, RateLimitConfig> = {
  listing: { maxRequests: 5, windowMs: 24 * 60 * 60 * 1000 },
  complaint: { maxRequests: 10, windowMs: 24 * 60 * 60 * 1000 },
  search: { maxRequests: 50, windowMs: 60 * 1000 },
};

/**
 * Checks if the current action is within rate limits.
 * Uses localStorage to persist limits across browser sessions.
 * @param type The type of action being rate limited
 * @returns boolean True if allowed, False if rate limited
 */
export function checkRateLimit(type: RateLimitType): boolean {
  if (typeof window === 'undefined') return true;
  
  const config = LIMITS[type];
  const key = `manaooru_ratelimit_${type}`;
  const now = Date.now();
  
  try {
    const rawData = localStorage.getItem(key);
    const data = rawData ? JSON.parse(rawData) : { count: 0, resetAt: 0 };
    
    if (now > data.resetAt) {
      // Window expired, reset
      localStorage.setItem(key, JSON.stringify({ count: 1, resetAt: now + config.windowMs }));
      return true;
    }
    
    if (data.count >= config.maxRequests) {
      return false; // Rate limited
    }
    
    // Increment count
    localStorage.setItem(key, JSON.stringify({ count: data.count + 1, resetAt: data.resetAt }));
    return true;
  } catch (err) {
    // Fallback if parsing fails
    localStorage.setItem(key, JSON.stringify({ count: 1, resetAt: now + config.windowMs }));
    return true;
  }
}
