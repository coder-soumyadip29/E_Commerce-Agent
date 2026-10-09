import cluster from "node:cluster";
import http from "node:http";
import os from "node:os";
import { spawn } from "node:child_process";

const numCPUs = os.cpus().length;
const workersCount = Math.max(2, Math.min(numCPUs, 8)); // Use up to 8 workers
const port = process.env.PORT || 3000;

if (cluster.isPrimary) {
  console.log(`==================================================`);
  console.log(`🚀 CARTWISE CLUSTER LOAD BALANCER PRIMARY PROCESS`);
  console.log(`   PID: ${process.pid}`);
  console.log(`   CPU Cores Available: ${numCPUs}`);
  console.log(`   Spawning Workers: ${workersCount}`);
  console.log(`   Master Port: ${port}`);
  console.log(`==================================================`);

  // Fork worker instances
  for (let i = 0; i < workersCount; i++) {
    const worker = cluster.fork({ WORKER_ID: `${i + 1}`, PORT: port });
    console.log(`[Primary] Spawned Worker #${i + 1} (PID: ${worker.process.pid})`);
  }

  // Handle worker exits with automatic zero-downtime respawning
  cluster.on("exit", (worker, code, signal) => {
    console.warn(`[Primary] Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Auto-recovering...`);
    const newWorker = cluster.fork({ PORT: port });
    console.log(`[Primary] Replacement Worker spawned (PID: ${newWorker.process.pid})`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("\n[Primary] Received termination signal. Draining workers gracefully...");
    for (const id in cluster.workers) {
      cluster.workers[id]?.kill("SIGTERM");
    }
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

} else {
  // Worker process runs the Next.js server
  const workerId = process.env.WORKER_ID || "unknown";
  console.log(`[Worker #${workerId}] Online and accepting load-balanced connections on port ${port}...`);

  // Start Next.js server instance
  const nextProcess = spawn("npx", ["next", "start", "-p", String(port)], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, PORT: String(port) },
  });

  nextProcess.on("exit", (code) => {
    process.exit(code || 0);
  });
}
