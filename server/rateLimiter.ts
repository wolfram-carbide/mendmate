/**
 * IP-based Rate Limiter for API endpoints
 * 
 * Limits:
 * - 2 requests per minute (short-term burst protection)
 * - 30 requests per 24 hours (daily quota)
 * 
 * Note: In-memory storage resets on server restart.
 * For production with multiple instances, consider Redis.
 */

interface RateLimitEntry {
  minuteCount: number;
  minuteResetTime: number;
  dailyCount: number;
  dailyResetTime: number;
}

const ipLimits = new Map<string, RateLimitEntry>();

const MINUTE_LIMIT = 2;
const DAILY_LIMIT = 30;
const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Check if a request from an IP should be rate limited
 * @returns { allowed: boolean, retryAfter?: number, message?: string }
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfter?: number;
  message?: string;
  remaining?: { minute: number; daily: number };
} {
  const now = Date.now();
  let entry = ipLimits.get(ip);

  if (!entry) {
    entry = {
      minuteCount: 0,
      minuteResetTime: now + MINUTE_MS,
      dailyCount: 0,
      dailyResetTime: now + DAY_MS,
    };
    ipLimits.set(ip, entry);
  }

  if (now > entry.minuteResetTime) {
    entry.minuteCount = 0;
    entry.minuteResetTime = now + MINUTE_MS;
  }

  if (now > entry.dailyResetTime) {
    entry.dailyCount = 0;
    entry.dailyResetTime = now + DAY_MS;
  }

  if (entry.dailyCount >= DAILY_LIMIT) {
    const retryAfter = Math.ceil((entry.dailyResetTime - now) / 1000);
    const hoursLeft = Math.ceil(retryAfter / 3600);
    return {
      allowed: false,
      retryAfter,
      message: `Daily limit reached (${DAILY_LIMIT} analyses per day). Please try again in ${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}.`,
    };
  }

  if (entry.minuteCount >= MINUTE_LIMIT) {
    const retryAfter = Math.ceil((entry.minuteResetTime - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      message: `Too many requests. Please wait ${retryAfter} second${retryAfter > 1 ? 's' : ''} before trying again.`,
    };
  }

  entry.minuteCount++;
  entry.dailyCount++;

  return {
    allowed: true,
    remaining: {
      minute: MINUTE_LIMIT - entry.minuteCount,
      daily: DAILY_LIMIT - entry.dailyCount,
    },
  };
}

/**
 * Clean up old entries to prevent memory leaks
 * Call periodically (e.g., every hour)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  const entries = Array.from(ipLimits.entries());
  for (const [ip, entry] of entries) {
    if (now > entry.dailyResetTime + DAY_MS) {
      ipLimits.delete(ip);
    }
  }
}

setInterval(cleanupExpiredEntries, 60 * 60 * 1000);
