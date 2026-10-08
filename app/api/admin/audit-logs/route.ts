import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { getAuditLogs } from "@/lib/adminDb";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const entityType = searchParams.get("entity_type");

  let logs = getAuditLogs();

  if (action && action !== "ALL") {
    logs = logs.filter((l) => l.action === action);
  }

  if (entityType && entityType !== "ALL") {
    logs = logs.filter((l) => l.entity_type === entityType);
  }

  return NextResponse.json({
    logs,
    total: logs.length,
  });
}
