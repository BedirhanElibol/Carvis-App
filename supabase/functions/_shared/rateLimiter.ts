/**
 * Edge Functions Rate Limiter & Token Budget Guard
 * In-Memory & Header-based Rate Limiter for Supabase Edge Functions.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Checks rate limit for a client IP or User ID.
 * @param identifier - IP address or user UUID
 * @param maxRequests - Max requests allowed in window
 * @param windowMs - Time window in milliseconds (default 1 minute)
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs
    };
    rateLimitMap.set(identifier, newRecord);
    return { allowed: true, remaining: maxRequests - 1, resetTime: newRecord.resetTime };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  rateLimitMap.set(identifier, record);

  return { allowed: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}
