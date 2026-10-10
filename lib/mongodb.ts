import dns from "dns";
import mongoose from "mongoose";

// Resolve MongoDB Atlas SRV records reliably on Windows/c-ares
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore in restricted environments
}
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cartwise";

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      dbName: "cartwise",
    };

    cached.promise = mongoose.connect(mongoUri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}
