import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSellerFromRequest } from "@/lib/sellerAuth";
import { getSellerOrders, updateSellerSubOrderStatus } from "@/lib/sellerDb";

export async function GET(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized seller session." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    // STRICT OWNERSHIP: Returns only sub-orders matching seller.id
    const orders = getSellerOrders(seller.id, { search, status });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized seller session." }, { status: 401 });
    }

    const body = await req.json();
    const { subOrderId, status, carrier, trackingNumber, rejectionReason } = body;

    if (!subOrderId) {
      return NextResponse.json({ error: "Sub-order ID is required." }, { status: 400 });
    }

    // STRICT IDOR OWNERSHIP CHECK
    const res = updateSellerSubOrderStatus(seller.id, Number(subOrderId), {
      status,
      carrier,
      trackingNumber,
      rejectionReason,
    });

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Order fulfillment updated." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
