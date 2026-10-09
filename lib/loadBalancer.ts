/**
 * CartWise Enterprise Load Balancer Engine
 * 
 * Supports:
 * - Algorithms: Round-Robin, Weighted Round-Robin, Least Connections, IP Hash (Sticky Sessions)
 * - Circuit Breaker with passive failure tracking and active health probing
 * - Automatic multi-node failover with retry logic
 * - Real-time metrics: active connections, latency, error rates
 */

export type LoadBalancingAlgorithm =
  | "round-robin"
  | "least-connections"
  | "ip-hash"
  | "weighted-round-robin";

export interface UpstreamNode {
  id: string;
  url: string;
  weight: number; // 1 - 10
  healthy: boolean;
  consecutiveFailures: number;
  activeConnections: number;
  totalRequests: number;
  failedRequests: number;
  latencyMs: number;
  lastChecked: number;
}

export interface LoadBalancerOptions {
  algorithm?: LoadBalancingAlgorithm;
  healthCheckPath?: string;
  healthCheckIntervalMs?: number;
  maxConsecutiveFailures?: number;
  retryAttempts?: number;
  timeoutMs?: number;
}

export class LoadBalancer {
  private nodes: UpstreamNode[] = [];
  private algorithm: LoadBalancingAlgorithm;
  private healthCheckPath: string;
  private healthCheckIntervalMs: number;
  private maxConsecutiveFailures: number;
  private retryAttempts: number;
  private timeoutMs: number;
  private currentIndex: number = 0;
  private healthCheckTimer: NodeJS.Timeout | null = null;

  constructor(options: LoadBalancerOptions = {}) {
    this.algorithm = options.algorithm || "round-robin";
    this.healthCheckPath = options.healthCheckPath || "/api/health";
    this.healthCheckIntervalMs = options.healthCheckIntervalMs || 30000;
    this.maxConsecutiveFailures = options.maxConsecutiveFailures || 3;
    this.retryAttempts = options.retryAttempts || 2;
    this.timeoutMs = options.timeoutMs || 5000;

    // Load initial nodes from environment if provided
    this.initFromEnv();
  }

  private initFromEnv() {
    const upstreamEnv = process.env.UPSTREAM_SERVERS;
    if (upstreamEnv) {
      const urls = upstreamEnv.split(",").map((s) => s.trim()).filter(Boolean);
      urls.forEach((url, i) => {
        this.addNode({
          id: `node-${i + 1}`,
          url,
          weight: 1,
        });
      });
    } else {
      // Default local cluster nodes
      const defaultPort = process.env.PORT || 3000;
      this.addNode({
        id: "primary-node",
        url: `http://localhost:${defaultPort}`,
        weight: 1,
      });
    }
  }

  public addNode(node: { id: string; url: string; weight?: number }) {
    // Prevent duplicates
    const cleanUrl = node.url.replace(/\/$/, "");
    if (this.nodes.some((n) => n.id === node.id || n.url === cleanUrl)) {
      return;
    }

    this.nodes.push({
      id: node.id,
      url: cleanUrl,
      weight: Math.max(1, node.weight || 1),
      healthy: true,
      consecutiveFailures: 0,
      activeConnections: 0,
      totalRequests: 0,
      failedRequests: 0,
      latencyMs: 0,
      lastChecked: Date.now(),
    });
  }

  public removeNode(id: string) {
    this.nodes = this.nodes.filter((n) => n.id !== id);
  }

  public getNodes(): UpstreamNode[] {
    return [...this.nodes];
  }

  public setAlgorithm(algo: LoadBalancingAlgorithm) {
    this.algorithm = algo;
  }

  public getAlgorithm(): LoadBalancingAlgorithm {
    return this.algorithm;
  }

  /**
   * Deterministic simple string hash for IP Hash algorithm
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Select an upstream node based on the configured balancing algorithm
   */
  public selectNode(clientIdentifier?: string): UpstreamNode | null {
    const healthyNodes = this.nodes.filter((n) => n.healthy);
    if (healthyNodes.length === 0) {
      // Emergency: if all nodes are flagged unhealthy, try any available node as last resort
      return this.nodes.length > 0 ? this.nodes[0] : null;
    }

    switch (this.algorithm) {
      case "least-connections": {
        // Find node with minimum active connections
        let leastNode = healthyNodes[0];
        for (let i = 1; i < healthyNodes.length; i++) {
          if (healthyNodes[i].activeConnections < leastNode.activeConnections) {
            leastNode = healthyNodes[i];
          }
        }
        return leastNode;
      }

      case "ip-hash": {
        if (!clientIdentifier) {
          return healthyNodes[0];
        }
        const hash = this.hashString(clientIdentifier);
        const index = hash % healthyNodes.length;
        return healthyNodes[index];
      }

      case "weighted-round-robin": {
        // Build weighted virtual array
        const weightedPool: UpstreamNode[] = [];
        healthyNodes.forEach((node) => {
          for (let w = 0; w < node.weight; w++) {
            weightedPool.push(node);
          }
        });
        if (weightedPool.length === 0) return healthyNodes[0];
        this.currentIndex = (this.currentIndex + 1) % weightedPool.length;
        return weightedPool[this.currentIndex];
      }

      case "round-robin":
      default: {
        this.currentIndex = (this.currentIndex + 1) % healthyNodes.length;
        return healthyNodes[this.currentIndex];
      }
    }
  }

  /**
   * Execute a request through the load balancer with automatic failover and circuit breaking
   */
  public async dispatchWithFailover(
    path: string,
    init: RequestInit = {},
    clientIdentifier?: string
  ): Promise<{ response: Response; node: UpstreamNode }> {
    const attempts = Math.min(this.retryAttempts + 1, Math.max(1, this.nodes.length));
    let lastError: any = null;

    for (let attempt = 0; attempt < attempts; attempt++) {
      const node = this.selectNode(clientIdentifier);
      if (!node) {
        throw new Error("Load balancer has no available upstream nodes.");
      }

      const startTime = Date.now();
      node.activeConnections += 1;
      node.totalRequests += 1;

      try {
        const targetUrl = `${node.url}${path.startsWith("/") ? "" : "/"}${path}`;

        // Create controller for timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(targetUrl, {
          ...init,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        const duration = Date.now() - startTime;
        node.latencyMs = Math.round((node.latencyMs + duration) / 2);
        node.activeConnections = Math.max(0, node.activeConnections - 1);

        // If upstream returned 5xx server error, mark failure
        if (response.status >= 500) {
          this.recordFailure(node);
          // Try next node if attempts remain
          if (attempt < attempts - 1) {
            continue;
          }
        } else {
          // Success: reset consecutive failures
          node.consecutiveFailures = 0;
          node.healthy = true;
        }

        return { response, node };
      } catch (err: any) {
        node.activeConnections = Math.max(0, node.activeConnections - 1);
        this.recordFailure(node);
        lastError = err;
      }
    }

    throw new Error(`Load balancer failover exhausted after ${attempts} attempts. Last error: ${lastError?.message || lastError}`);
  }

  /**
   * Records a node failure and triggers circuit breaking if threshold is met
   */
  public recordFailure(node: UpstreamNode) {
    node.failedRequests += 1;
    node.consecutiveFailures += 1;

    if (node.consecutiveFailures >= this.maxConsecutiveFailures) {
      node.healthy = false;
      console.warn(`[LoadBalancer] Circuit breaker tripped: Node ${node.id} (${node.url}) marked UNHEALTHY.`);
    }
  }

  /**
   * Health probe execution for all registered nodes
   */
  public async probeAllNodes(): Promise<Record<string, { healthy: boolean; latencyMs: number }>> {
    const results: Record<string, { healthy: boolean; latencyMs: number }> = {};

    await Promise.all(
      this.nodes.map(async (node) => {
        const startTime = Date.now();
        node.lastChecked = startTime;

        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3000);

          const res = await fetch(`${node.url}${this.healthCheckPath}`, {
            method: "GET",
            signal: controller.signal,
          });

          clearTimeout(timer);

          const latency = Date.now() - startTime;
          node.latencyMs = latency;

          if (res.ok) {
            node.healthy = true;
            node.consecutiveFailures = 0;
            results[node.id] = { healthy: true, latencyMs: latency };
          } else {
            this.recordFailure(node);
            results[node.id] = { healthy: false, latencyMs: latency };
          }
        } catch {
          this.recordFailure(node);
          results[node.id] = { healthy: false, latencyMs: Date.now() - startTime };
        }
      })
    );

    return results;
  }

  /**
   * Starts background recurring health check interval
   */
  public startHealthCheck() {
    if (this.healthCheckTimer) return;
    this.healthCheckTimer = setInterval(() => {
      this.probeAllNodes().catch((err) =>
        console.warn("[LoadBalancer] Health check probe error:", err.message)
      );
    }, this.healthCheckIntervalMs);

    this.healthCheckTimer.unref?.();
  }

  /**
   * Stops background health check interval
   */
  public stopHealthCheck() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Clear all nodes (for testing)
   */
  public clear() {
    this.stopHealthCheck();
    this.nodes = [];
    this.currentIndex = 0;
  }
}

// Global Singleton Load Balancer Instance
export const globalLoadBalancer = new LoadBalancer();
