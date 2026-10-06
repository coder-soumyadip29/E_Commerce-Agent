import { NextRequest, NextResponse } from "next/server";
import { cancelOrderDb } from "@/lib/db";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const orderId = Number(id);
    if (!orderId || isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || "Customer cancelled order from dashboard";

    const res = cancelOrderDb(orderId, reason);
    if (!res.success) {
      return NextResponse.json({ error: res.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: res.message,
      order: res.order,
      restoredItems: res.restoredItems,
    });
  } catch (error: any) {
    console.error("Order cancellation failed:", error);
    return NextResponse.json(
      { error: error?.message || "Cancellation failed" },
      { status: 500 }
    );
  }
}
