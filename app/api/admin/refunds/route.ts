import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  getRefunds,
  updateRefundStatus,
  addAuditLog,
} from "@/lib/adminDb";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  let refunds = getRefunds();
  if (status && status !== "ALL") {
    refunds = refunds.filter((r) => r.status === status);
  }

  return NextResponse.json({
    refunds,
    total: refunds.length,
    counts: {
      all: getRefunds().length,
      pending: getRefunds().filter((r) => r.status === "PENDING").length,
      approved: getRefunds().filter((r) => r.status === "APPROVED").length,
      processed: getRefunds().filter((r) => r.status === "PROCESSED").length,
      rejected: getRefunds().filter((r) => r.status === "REJECTED").length,
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
    const { refund_id, status } = body;

    if (!refund_id || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    updateRefundStatus(refund_id, status);
    addAuditLog({
      admin_id: session.id,
      admin_name: session.name,
      action: "UPDATE_REFUND_STATUS",
      entity_type: "REFUND",
      entity_id: refund_id,
      details: `Updated refund status to ${status}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
