import fs from "fs";
import path from "path";

// Load .env.local if not loaded
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

import { connectToDatabase } from "../lib/mongodb";
import mongoose from "mongoose";

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGODB_URI is not defined in .env.local or environment.");
    process.exit(1);
  }

  const maskedUri = mongoUri.replace(/:([^@]+)@/, ":****@");
  console.log(`Connecting to: ${maskedUri}`);

  const start = Date.now();
  try {
    const conn = await connectToDatabase();
    const elapsed = Date.now() - start;
    console.log(`✅ Successfully connected to MongoDB in ${elapsed}ms!`);
    console.log(`📡 Database name: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`🔄 Connection readyState: ${conn.connection.readyState} (1 = connected)`);

    if (conn.connection.db) {
      const pingResult = await conn.connection.db.admin().ping();
      console.log(`🏓 Ping:`, pingResult);
      const collections = await conn.connection.db.listCollections().toArray();
      console.log(`📂 Collections:`, collections.map((c) => c.name));
    }

    await mongoose.disconnect();
    console.log("🔒 Disconnected cleanly.");
    process.exit(0);
  } catch (err: any) {
    const elapsed = Date.now() - start;
    console.error(`❌ Connection failed after ${elapsed}ms:`);
    console.error(err.message || err);
    process.exit(1);
  }
}

main();
