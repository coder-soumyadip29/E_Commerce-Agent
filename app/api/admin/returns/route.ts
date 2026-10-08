import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  getReturnRequests,
  updateReturnStatus,
  addAuditLog,
} from "@/lib/adminDb";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let returns = getReturnRequests();
  if (status && status !== "ALL") {
    returns = returns.filter((r) => r.status === status);
  }

  return NextResponse.json({
    returns,
    total: returns.length,
    counts: {
      all: getReturnRequests().length,
      requested: getReturnRequests().filter((r) => r.status === "REQUESTED").length,
      approved: getReturnRequests().filter((r) => r.status === "APPROVED").length,
      item_received: getReturnRequests().filter((r) => r.status === "ITEM_RECEIVED").length,
      completed: getReturnRequests().filter((r) => r.status === "COMPLETED").length,
      rejected: getReturnRequests().filter((r) => r.status === "REJECTED").length,
    },
  });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { return_id, status } = body;

    if (!return_id || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    updateReturnStatus(return_id, status);
    addAuditLog({
      admin_id: session.id,
      admin_name: session.name,
      action: "UPDATE_RETURN_STATUS",
      entity_type: "RETURN",
      entity_id: return_id,
      details: `Updated return request status to ${status}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
