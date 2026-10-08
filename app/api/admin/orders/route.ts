import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  getOrdersWithSellerSplits,
  updateSellerOrderStatus,
  updateParentOrderStatus,
  addAuditLog,
} from "@/lib/adminDb";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.toLowerCase();

  let orders = getOrdersWithSellerSplits();

  if (status && status !== "ALL") {
    orders = orders.filter((o) => o.status === status);
  }

  if (search) {
    orders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(search) ||
        o.user_id.toLowerCase().includes(search) ||
        o.shipping_address?.full_name?.toLowerCase().includes(search) ||
        o.shipping_address?.city?.toLowerCase().includes(search)
    );
  }

  const allOrders = getOrdersWithSellerSplits();
  const counts = {
    all: allOrders.length,
    pending: allOrders.filter((o) => o.status === "PENDING").length,
    processing: allOrders.filter((o) => o.status === "PROCESSING").length,
    shipped: allOrders.filter((o) => o.status === "SHIPPED").length,
    delivered: allOrders.filter((o) => o.status === "DELIVERED").length,
    cancelled: allOrders.filter((o) => o.status === "CANCELLED").length,
  };

  return NextResponse.json({
    orders,
    total: orders.length,
    counts,
  });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, order_id, seller_order_id, status, tracking_number } = body;

    if (action === "update_parent_status" && order_id) {
      updateParentOrderStatus(order_id, status);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "UPDATE_ORDER_STATUS",
        entity_type: "ORDER",
        entity_id: order_id,
        details: `Updated parent order status to ${status}`,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "update_seller_order_status" && seller_order_id) {
      updateSellerOrderStatus(seller_order_id, status, tracking_number);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "UPDATE_SELLER_ORDER_STATUS",
        entity_type: "SELLER_ORDER",
        entity_id: seller_order_id,
        details: `Updated seller order ${seller_order_id} status to ${status}${tracking_number ? ` with tracking ${tracking_number}` : ""}`,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
