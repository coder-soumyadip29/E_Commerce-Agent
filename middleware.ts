import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRouteTier } from "./lib/edgeRateLimit";
import { getEdgeCacheHeaders } from "./lib/edgeCache";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply rate limiting to API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Derive client IP or fallback identifier
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : request.headers.get("x-real-ip") || "127.0.0.1";

  // Determine rate limit rule based on route sensitivity
  const rule = getRouteTier(pathname);
  const routeCategory = pathname.split("/")[2] || "general";
  const rateLimitResult = await checkRateLimit(
    `${routeCategory}:${clientIp}`,
    rule
  );

  // If rate limit exceeded, block with 429 Too Many Requests
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: "Too many requests. You have exceeded the permitted rate limit.",
        retryAfter: rateLimitResult.retryAfter,
        limit: rateLimitResult.limit,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimitResult.limit.toString(),
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
          "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          "Retry-After": rateLimitResult.retryAfter.toString(),
          "X-RateLimit-Source": rateLimitResult.source,
        },
      }
    );
  }

  // Request allowed: Continue with headers attached
  const response = NextResponse.next();

  response.headers.set("X-RateLimit-Limit", rateLimitResult.limit.toString());
  response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString());
  response.headers.set("X-RateLimit-Reset", rateLimitResult.reset.toString());
  response.headers.set("X-RateLimit-Source", rateLimitResult.source);
  response.headers.set("X-LoadBalancer-Node", process.env.WORKER_ID ? `worker-${process.env.WORKER_ID}` : "primary-node");

  // Attach Edge CDN Cache headers for public catalog read operations
  if (
    request.method === "GET" &&
    (pathname.startsWith("/api/products") || pathname.startsWith("/api/store"))
  ) {
    const cacheHeaders = getEdgeCacheHeaders({ sMaxAge: 60, staleWhileRevalidate: 300 });
    for (const [key, val] of Object.entries(cacheHeaders)) {
      response.headers.set(key, val);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all API request paths
     */
    "/api/:path*",
  ],
};
