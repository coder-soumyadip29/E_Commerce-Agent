import { NextRequest, NextResponse } from "next/server";
import { updateOrderTrackingStatusDb, getOrderById } from "@/lib/db";
import { OrderTrackingStatus } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const orderId = Number(id);
    if (!orderId || isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const body = await req.json();
    const { trackingStatus, estimatedDeliveryTime } = body;

    const validStages: OrderTrackingStatus[] = ["placed", "packing", "out_for_delivery", "delivered", "cancelled"];
    if (!validStages.includes(trackingStatus)) {
      return NextResponse.json(
        { error: `Invalid tracking stage. Allowed: ${validStages.join(", ")}` },
        { status: 400 }
      );
    }

    const res = updateOrderTrackingStatusDb(
      orderId,
      trackingStatus as OrderTrackingStatus,
      estimatedDeliveryTime
    );

    if (!res.success || !res.order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: res.order });
  } catch (error: any) {
    console.error("Tracking update failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update tracking stage" },
      { status: 500 }
    );
  }
}
