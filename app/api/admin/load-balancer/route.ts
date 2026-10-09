import { NextRequest, NextResponse } from "next/server";
import { globalLoadBalancer, LoadBalancingAlgorithm } from "@/lib/loadBalancer";

export async function GET() {
  const nodes = globalLoadBalancer.getNodes();
  const algorithm = globalLoadBalancer.getAlgorithm();

  const totalRequests = nodes.reduce((sum, n) => sum + n.totalRequests, 0);
  const totalFailed = nodes.reduce((sum, n) => sum + n.failedRequests, 0);
  const healthyCount = nodes.filter((n) => n.healthy).length;

  return NextResponse.json({
    success: true,
    algorithm,
    summary: {
      totalNodes: nodes.length,
      healthyNodes: healthyCount,
      unhealthyNodes: nodes.length - healthyCount,
      totalRequestsServed: totalRequests,
      totalFailures: totalFailed,
      overallHealth: healthyCount === nodes.length ? "HEALTHY" : healthyCount > 0 ? "DEGRADED" : "CRITICAL",
    },
    nodes,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "set_algorithm";

    if (action === "set_algorithm") {
      const algo = body.algorithm as LoadBalancingAlgorithm;
      if (!["round-robin", "least-connections", "ip-hash", "weighted-round-robin"].includes(algo)) {
        return NextResponse.json({ error: "Invalid algorithm. Supported: round-robin, least-connections, ip-hash, weighted-round-robin" }, { status: 400 });
      }
      globalLoadBalancer.setAlgorithm(algo);
      return NextResponse.json({ success: true, message: `Algorithm updated to ${algo}`, algorithm: algo });
    }

    if (action === "add_node") {
      if (!body.url) {
        return NextResponse.json({ error: "Upstream URL is required." }, { status: 400 });
      }
      const id = body.id || `node-${Date.now().toString(36)}`;
      globalLoadBalancer.addNode({ id, url: body.url, weight: body.weight });
      return NextResponse.json({ success: true, message: `Node ${id} added`, nodes: globalLoadBalancer.getNodes() });
    }

    if (action === "remove_node") {
      if (!body.id) {
        return NextResponse.json({ error: "Node ID is required." }, { status: 400 });
      }
      globalLoadBalancer.removeNode(body.id);
      return NextResponse.json({ success: true, message: `Node ${body.id} removed`, nodes: globalLoadBalancer.getNodes() });
    }

    if (action === "probe") {
      const results = await globalLoadBalancer.probeAllNodes();
      return NextResponse.json({ success: true, message: "Probe completed", probeResults: results, nodes: globalLoadBalancer.getNodes() });
    }

    return NextResponse.json({ error: "Unknown action. Supported: set_algorithm, add_node, remove_node, probe" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process load balancer operation" }, { status: 500 });
  }
}
