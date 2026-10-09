/**
 * CartWise Edge Caching Layer
 * 
 * Supports Upstash Redis REST KV storage for distributed edge caching with an
 * in-memory TTL store fallback for local development and offline resilience.
 * Also provides standard HTTP Cache-Control header helpers for Edge CDN caching.
 */

interface CacheEntry {
  value: string;
  expiresAt: number; // Unix timestamp ms
}

const memoryCache = new Map<string, CacheEntry>();

// Purge expired memory cache entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryCache.entries()) {
      if (now > entry.expiresAt) {
        memoryCache.delete(key);
      }
    }
  }, 60 * 1000).unref?.();
}

/**
 * Retrieve cached value from Upstash Redis or memory fallback
 */
export async function getEdgeCache<T>(key: string, prefix: string = "cartwise_cache"): Promise<T | null> {
  const fullKey = `${prefix}:${key}`;
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const response = await fetch(`${upstashUrl}/get/${encodeURIComponent(fullKey)}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result !== null && data.result !== undefined) {
          try {
            return JSON.parse(data.result) as T;
          } catch {
            return data.result as T;
          }
        }
      }
    } catch (err) {
      console.warn("Upstash Redis get cache failed, falling back to memory:", (err as Error).message);
    }
  }

  // Memory fallback
  const entry = memoryCache.get(fullKey);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(fullKey);
    return null;
  }

  try {
    return JSON.parse(entry.value) as T;
  } catch {
    return entry.value as unknown as T;
  }
}

/**
 * Store value in Upstash Redis or memory fallback with TTL in seconds
 */
export async function setEdgeCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = 60,
  prefix: string = "cartwise_cache"
): Promise<void> {
  const fullKey = `${prefix}:${key}`;
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      await fetch(`${upstashUrl}/set/${encodeURIComponent(fullKey)}/${encodeURIComponent(serialized)}?EX=${ttlSeconds}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: "no-store",
      });
      return;
    } catch (err) {
      console.warn("Upstash Redis set cache failed, falling back to memory:", (err as Error).message);
    }
  }

  // Memory fallback
  memoryCache.set(fullKey, {
    value: serialized,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Delete cached entry
 */
export async function deleteEdgeCache(key: string, prefix: string = "cartwise_cache"): Promise<void> {
  const fullKey = `${prefix}:${key}`;
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      await fetch(`${upstashUrl}/del/${encodeURIComponent(fullKey)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: "no-store",
      });
    } catch {
      // Ignore
    }
  }

  memoryCache.delete(fullKey);
}

/**
 * Generates standard Edge CDN Cache-Control headers
 * Example: Cache-Control: public, s-maxage=60, stale-while-revalidate=300
 */
export function getEdgeCacheHeaders(options: {
  maxAge?: number;
  sMaxAge?: number; // CDN Edge TTL in seconds
  staleWhileRevalidate?: number; // Background revalidation window
} = {}): Record<string, string> {
  const { maxAge = 0, sMaxAge = 60, staleWhileRevalidate = 300 } = options;

  return {
    "Cache-Control": `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    "CDN-Cache-Control": `public, s-maxage=${sMaxAge}`,
    "Vary": "Accept-Encoding, Origin",
  };
}
