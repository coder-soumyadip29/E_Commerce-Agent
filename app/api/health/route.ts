import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import mongoose from "mongoose";

export async function GET() {
  const startTime = Date.now();
  const memory = process.memoryUsage();

  // 1. Check SQLite status
  let sqliteStatus = "UP";
  try {
    const db = getDb();
    if (db) {
      db.prepare("SELECT 1").get();
    } else {
      sqliteStatus = "STANDBY_MEMORY_FALLBACK";
    }
  } catch (err: any) {
    sqliteStatus = `DOWN: ${err.message}`;
  }

  // 2. Check MongoDB status
  const mongoState = mongoose.connection?.readyState;
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const mongoStatus =
    mongoState === 1
      ? "UP"
      : mongoState === 2
      ? "CONNECTING"
      : "DISCONNECTED_OR_STANDBY";

  // 3. Check Upstash Redis configuration
  const redisConfigured = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );

  const duration = Date.now() - startTime;

  return NextResponse.json(
    {
      status: sqliteStatus === "UP" ? "UP" : "DEGRADED",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      pid: process.pid,
      responseTimeMs: duration,
      checks: {
        sqliteDatabase: sqliteStatus,
        mongoDatabase: mongoStatus,
        upstashRedis: redisConfigured ? "CONFIGURED" : "IN_MEMORY_FALLBACK",
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memoryUsageMb: {
          rss: Math.round(memory.rss / 1024 / 1024),
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        },
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
