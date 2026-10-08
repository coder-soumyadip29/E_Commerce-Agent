import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  getPayouts,
  updatePayoutStatus,
  addAuditLog,
  getSellers,
} from "@/lib/adminDb";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const sellerId = searchParams.get("seller_id");

  let payouts = getPayouts();

  if (status && status !== "ALL") {
    payouts = payouts.filter((p) => p.status === status);
  }

  if (sellerId && sellerId !== "ALL") {
    payouts = payouts.filter((p) => p.seller_id === sellerId);
  }

  const allPayouts = getPayouts();
  const counts = {
    all: allPayouts.length,
    pending: allPayouts.filter((p) => p.status === "PENDING").length,
    approved: allPayouts.filter((p) => p.status === "APPROVED").length,
    paid: allPayouts.filter((p) => p.status === "PAID").length,
    rejected: allPayouts.filter((p) => p.status === "REJECTED").length,
  };

  return NextResponse.json({
    payouts,
    total: payouts.length,
    counts,
    sellers: getSellers().map((s) => ({ id: s.id, name: s.business_name })),
  });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { payout_id, status, transaction_reference } = body;

    if (!payout_id || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    updatePayoutStatus(payout_id, status, transaction_reference);

    addAuditLog({
      admin_id: session.id,
      admin_name: session.name,
      action: "UPDATE_PAYOUT_STATUS",
      entity_type: "PAYOUT",
      entity_id: payout_id,
      details: `Updated payout ${payout_id} to ${status}${transaction_reference ? ` with ref: ${transaction_reference}` : ""}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
