/**
 * CartWise Edge Rate Limiter
 * 
 * Supports Upstash Redis REST API (Edge & Serverless compatible) with an automatic
 * high-performance in-memory sliding window fallback for local development/offline resilience.
 */

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // Unix epoch seconds
  retryAfter: number; // seconds
  source: "upstash_redis" | "in_memory";
}

export interface RateLimitRule {
  limit: number;
  windowSeconds: number;
}

// In-memory sliding window store for offline / dev fallback
interface MemoryBucket {
  count: number;
  resetAt: number; // timestamp in ms
}

const memoryStore = new Map<string, MemoryBucket>();

// Clean up expired keys periodically to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of memoryStore.entries()) {
      if (now > bucket.resetAt) {
        memoryStore.delete(key);
      }
    }
  }, 60 * 1000).unref?.();
}

/**
 * Default tier configuration per route pattern
 */
export const ROUTE_RATE_LIMIT_RULES: Record<string, RateLimitRule> = {
  // Strictest: Authentication, registration, OTP codes, password resets
  auth: { limit: 10, windowSeconds: 60 },
  // Strict: Payment processing and checkout
  payment: { limit: 15, windowSeconds: 60 },
  // Moderate: AI Copilot and visual product search (LLM protection)
  ai: { limit: 30, windowSeconds: 60 },
  // Standard: General API endpoints (products, cart, orders)
  general: { limit: 100, windowSeconds: 60 },
};

export function getRouteTier(pathname: string): RateLimitRule {
  if (pathname.startsWith("/api/auth")) return ROUTE_RATE_LIMIT_RULES.auth;
  if (pathname.startsWith("/api/payment") || pathname.startsWith("/api/checkout")) return ROUTE_RATE_LIMIT_RULES.payment;
  if (pathname.startsWith("/api/chat") || pathname.startsWith("/api/image-search")) return ROUTE_RATE_LIMIT_RULES.ai;
  return ROUTE_RATE_LIMIT_RULES.general;
}

/**
 * Check and record a rate-limited request using Upstash Redis REST or memory fallback
 */
export async function checkRateLimit(
  identifier: string,
  rule: RateLimitRule,
  prefix: string = "cartwise_rl"
): Promise<RateLimitResult> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Use Upstash Redis REST if configured
  if (upstashUrl && upstashToken) {
    try {
      const key = `${prefix}:${identifier}`;
      const nowSec = Math.floor(Date.now() / 1000);
      const resetEpoch = nowSec + rule.windowSeconds;

      // Pipeline INCR and EXPIRE atomically via REST API
      const response = await fetch(`${upstashUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, rule.windowSeconds],
          ["TTL", key],
        ]),
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        // Result format: [{ result: count }, { result: 1 }, { result: ttl }]
        const count = typeof data[0]?.result === "number" ? data[0].result : 1;
        const ttl = typeof data[2]?.result === "number" && data[2].result > 0 ? data[2].result : rule.windowSeconds;

        const remaining = Math.max(0, rule.limit - count);
        const success = count <= rule.limit;
        const reset = nowSec + ttl;
        const retryAfter = success ? 0 : Math.max(1, ttl);

        return {
          success,
          limit: rule.limit,
          remaining,
          reset,
          retryAfter,
          source: "upstash_redis",
        };
      }
    } catch (err) {
      console.warn("Upstash Redis rate limit check failed, falling back to in-memory:", (err as Error).message);
    }
  }

  // Resilient In-Memory Sliding Window Fallback
  const key = `${prefix}:${identifier}`;
  const now = Date.now();
  let bucket = memoryStore.get(key);

  if (!bucket || now > bucket.resetAt) {
    bucket = {
      count: 1,
      resetAt: now + rule.windowSeconds * 1000,
    };
    memoryStore.set(key, bucket);

    return {
      success: true,
      limit: rule.limit,
      remaining: rule.limit - 1,
      reset: Math.ceil(bucket.resetAt / 1000),
      retryAfter: 0,
      source: "in_memory",
    };
  }

  bucket.count += 1;
  const remaining = Math.max(0, rule.limit - bucket.count);
  const success = bucket.count <= rule.limit;
  const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));

  return {
    success,
    limit: rule.limit,
    remaining,
    reset: Math.ceil(bucket.resetAt / 1000),
    retryAfter: success ? 0 : retryAfterSeconds,
    source: "in_memory",
  };
}

/**
 * Resets a memory key (primarily for unit testing and manual administrative unblocks)
 */
export function resetMemoryRateLimit(identifier: string, prefix: string = "cartwise_rl") {
  memoryStore.delete(`${prefix}:${identifier}`);
}
