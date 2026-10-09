import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  getRouteTier,
  resetMemoryRateLimit,
  ROUTE_RATE_LIMIT_RULES,
} from "../lib/edgeRateLimit";
import {
  getEdgeCache,
  setEdgeCache,
  deleteEdgeCache,
  getEdgeCacheHeaders,
} from "../lib/edgeCache";
import { middleware } from "../middleware";
import { NextRequest } from "next/server";

describe("Edge Rate Limiter & Caching Layer", () => {
  const testIp = "192.168.1.100";

  beforeEach(() => {
    resetMemoryRateLimit(testIp, "cartwise_rl");
    resetMemoryRateLimit(`test_user_${testIp}`, "cartwise_rl");
  });

  describe("Rate Limiting Logic", () => {
    it("assigns appropriate rate limit rules per route tier", () => {
      expect(getRouteTier("/api/auth").limit).toBe(10);
      expect(getRouteTier("/api/payment/verify").limit).toBe(15);
      expect(getRouteTier("/api/chat").limit).toBe(30);
      expect(getRouteTier("/api/products").limit).toBe(100);
    });

    it("allows requests below the defined limit and tracks remaining quota", async () => {
      const rule = { limit: 5, windowSeconds: 60 };

      // First request
      const res1 = await checkRateLimit(testIp, rule);
      expect(res1.success).toBe(true);
      expect(res1.remaining).toBe(4);
      expect(res1.limit).toBe(5);

      // Second request
      const res2 = await checkRateLimit(testIp, rule);
      expect(res2.success).toBe(true);
      expect(res2.remaining).toBe(3);
    });

    it("strictly blocks requests when the limit is exceeded and returns retryAfter", async () => {
      const tightRule = { limit: 2, windowSeconds: 60 };
      const client = "spammer_ip_99";

      const r1 = await checkRateLimit(client, tightRule);
      expect(r1.success).toBe(true);

      const r2 = await checkRateLimit(client, tightRule);
      expect(r2.success).toBe(true);
      expect(r2.remaining).toBe(0);

      // Third request should be blocked
      const r3 = await checkRateLimit(client, tightRule);
      expect(r3.success).toBe(false);
      expect(r3.remaining).toBe(0);
      expect(r3.retryAfter).toBeGreaterThan(0);
    });
  });

  describe("Edge Caching Layer", () => {
    it("stores and retrieves typed values from the edge cache", async () => {
      const cacheKey = "popular_products_sample";
      const sampleData = { id: 1, name: "Organic Wild Honey", price: 14.99 };

      await setEdgeCache(cacheKey, sampleData, 60);
      const retrieved = await getEdgeCache<typeof sampleData>(cacheKey);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(1);
      expect(retrieved?.name).toBe("Organic Wild Honey");
    });

    it("deletes cached entries on demand", async () => {
      const cacheKey = "temp_session_key";
      await setEdgeCache(cacheKey, { valid: true }, 60);

      let found = await getEdgeCache(cacheKey);
      expect(found).not.toBeNull();

      await deleteEdgeCache(cacheKey);
      found = await getEdgeCache(cacheKey);
      expect(found).toBeNull();
    });

    it("generates correct RFC CDN Cache-Control headers", () => {
      const headers = getEdgeCacheHeaders({ sMaxAge: 120, staleWhileRevalidate: 600 });
      expect(headers["Cache-Control"]).toContain("s-maxage=120");
      expect(headers["Cache-Control"]).toContain("stale-while-revalidate=600");
      expect(headers["CDN-Cache-Control"]).toBe("public, s-maxage=120");
    });
  });

  describe("Next.js Edge Middleware Integration", () => {
    it("attaches rate limit headers on allowed requests", async () => {
      const req = new NextRequest("http://localhost:3000/api/products", {
        headers: { "x-forwarded-for": "203.0.113.1" },
      });

      const res = await middleware(req);
      expect(res.headers.get("X-RateLimit-Limit")).toBeDefined();
      expect(res.headers.get("X-RateLimit-Remaining")).toBeDefined();
      expect(res.headers.get("X-RateLimit-Source")).toBeDefined();
    });

    it("attaches Edge CDN cache headers on GET catalog requests", async () => {
      const req = new NextRequest("http://localhost:3000/api/products", {
        method: "GET",
        headers: { "x-forwarded-for": "203.0.113.2" },
      });

      const res = await middleware(req);
      expect(res.headers.get("Cache-Control")).toContain("s-maxage=60");
      expect(res.headers.get("CDN-Cache-Control")).toBe("public, s-maxage=60");
    });

    it("returns HTTP 429 when client exceeds route rate limit", async () => {
      const abuserIp = "198.51.100.99";
      const authUrl = "http://localhost:3000/api/auth";

      // Exhaust auth limit (10 requests)
      for (let i = 0; i < 10; i++) {
        const req = new NextRequest(authUrl, {
          method: "POST",
          headers: { "x-forwarded-for": abuserIp },
        });
        await middleware(req);
      }

      // 11th request should receive 429 Too Many Requests
      const blockedReq = new NextRequest(authUrl, {
        method: "POST",
        headers: { "x-forwarded-for": abuserIp },
      });
      const blockedRes = await middleware(blockedReq);
      expect(blockedRes.status).toBe(429);

      const json = await blockedRes.json();
      expect(json.error).toMatch(/too many requests/i);
      expect(blockedRes.headers.get("Retry-After")).toBeDefined();
    });
  });
});
