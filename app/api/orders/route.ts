import { NextRequest, NextResponse } from "next/server";
import { getOrders, createOrder } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("userId");

    if (userIdParam === "guest") {
      return NextResponse.json({ success: true, orders: [] });
    }

    const userId = userIdParam && !isNaN(Number(userIdParam)) ? Number(userIdParam) : undefined;
    const orders = getOrders(userId);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to retrieve orders from database." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productId = Number(body.productId);
    const userId = Number(body.userId) || 1;

    if (!productId || isNaN(productId)) {
      return NextResponse.json(
        { error: "A valid numeric productId is required to place an order." },
        { status: 400 }
      );
    }

    const { order, success } = createOrder(productId, userId);
    return NextResponse.json({ success, order });
  } catch (error: any) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create order." },
      { status: 400 }
    );
  }
}
