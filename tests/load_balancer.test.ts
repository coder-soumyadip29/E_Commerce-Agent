import { describe, it, expect, beforeEach } from "vitest";
import { LoadBalancer } from "../lib/loadBalancer";
import { GET as healthCheckGet } from "../app/api/health/route";
import { GET as adminLbGet, POST as adminLbPost } from "../app/api/admin/load-balancer/route";
import { NextRequest } from "next/server";

describe("Enterprise Load Balancer Subsystem", () => {
  let lb: LoadBalancer;

  beforeEach(() => {
    lb = new LoadBalancer({
      algorithm: "round-robin",
      maxConsecutiveFailures: 3,
    });
    lb.clear();

    // Register 3 test nodes
    lb.addNode({ id: "node-1", url: "http://10.0.0.1:3000", weight: 1 });
    lb.addNode({ id: "node-2", url: "http://10.0.0.2:3000", weight: 2 });
    lb.addNode({ id: "node-3", url: "http://10.0.0.3:3000", weight: 1 });
  });

  describe("Balancing Algorithms", () => {
    it("cycles through nodes sequentially using Round-Robin", () => {
      lb.setAlgorithm("round-robin");
      const selected = [
        lb.selectNode()?.id,
        lb.selectNode()?.id,
        lb.selectNode()?.id,
        lb.selectNode()?.id,
      ];

      expect(selected[0]).not.toBeUndefined();
      expect(selected[1]).not.toBeUndefined();
      expect(selected[2]).not.toBeUndefined();
      // Wraps back around
      expect(selected[3]).toBe(selected[0]);
    });

    it("routes to the node with the fewest active connections using Least-Connections", () => {
      lb.setAlgorithm("least-connections");
      const nodes = lb.getNodes();

      // Simulate heavy load on node-1 and node-2
      nodes[0].activeConnections = 15;
      nodes[1].activeConnections = 20;
      nodes[2].activeConnections = 2; // node-3 has least connections

      const selected = lb.selectNode();
      expect(selected?.id).toBe("node-3");
    });

    it("deterministically routes same client IP to the same node using IP Hash (Sticky Sessions)", () => {
      lb.setAlgorithm("ip-hash");
      const clientA = "192.168.1.50";
      const clientB = "10.15.20.100";

      const firstPickA = lb.selectNode(clientA);
      const secondPickA = lb.selectNode(clientA);
      const thirdPickA = lb.selectNode(clientA);

      expect(firstPickA?.id).toBe(secondPickA?.id);
      expect(secondPickA?.id).toBe(thirdPickA?.id);

      const pickB = lb.selectNode(clientB);
      expect(pickB).toBeDefined();
    });

    it("distributes traffic proportional to weights using Weighted Round-Robin", () => {
      lb.setAlgorithm("weighted-round-robin");
      const selections: Record<string, number> = { "node-1": 0, "node-2": 0, "node-3": 0 };

      // Sample 40 selections
      for (let i = 0; i < 40; i++) {
        const picked = lb.selectNode();
        if (picked) selections[picked.id] += 1;
      }

      // node-2 has weight 2, while node-1 and node-3 have weight 1
      expect(selections["node-2"]).toBeGreaterThan(selections["node-1"]);
      expect(selections["node-2"]).toBeGreaterThan(selections["node-3"]);
    });
  });

  describe("Circuit Breaker & Failure Handling", () => {
    it("trips circuit breaker after max consecutive failures and removes node from active pool", () => {
      const nodes = lb.getNodes();
      const failingNode = nodes[0];

      // Fail 3 times
      lb.recordFailure(failingNode);
      expect(failingNode.healthy).toBe(true);
      lb.recordFailure(failingNode);
      expect(failingNode.healthy).toBe(true);
      lb.recordFailure(failingNode);

      // Tripped
      expect(failingNode.healthy).toBe(false);
      expect(failingNode.consecutiveFailures).toBe(3);

      // Ensure selectNode no longer returns the failing node
      for (let i = 0; i < 10; i++) {
        const node = lb.selectNode();
        expect(node?.id).not.toBe(failingNode.id);
      }
    });

    it("falls back to available nodes when one node is unhealthy", () => {
      const nodes = lb.getNodes();
      nodes[0].healthy = false;
      nodes[1].healthy = false;
      // Only node-3 is healthy
      const picked = lb.selectNode();
      expect(picked?.id).toBe("node-3");
    });
  });

  describe("Health Check API (/api/health)", () => {
    it("returns system status, memory usage, and database checks", async () => {
      const res = await healthCheckGet();
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.status).toBeDefined();
      expect(json.uptimeSeconds).toBeGreaterThanOrEqual(0);
      expect(json.pid).toBeDefined();
      expect(json.checks).toBeDefined();
      expect(["UP", "STANDBY_MEMORY_FALLBACK"]).toContain(json.checks.sqliteDatabase);
      expect(json.system.memoryUsageMb).toBeDefined();
    });
  });

  describe("Admin Load Balancer Telemetry API (/api/admin/load-balancer)", () => {
    it("returns active nodes, health summary, and algorithm", async () => {
      const res = await adminLbGet();
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.algorithm).toBeDefined();
      expect(json.summary).toBeDefined();
      expect(Array.isArray(json.nodes)).toBe(true);
    });

    it("allows updating the load balancing algorithm dynamically via POST", async () => {
      const req = new NextRequest("http://localhost:3000/api/admin/load-balancer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_algorithm",
          algorithm: "least-connections",
        }),
      });

      const res = await adminLbPost(req);
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.algorithm).toBe("least-connections");
    });
  });
});
