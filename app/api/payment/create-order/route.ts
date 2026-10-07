import { NextRequest, NextResponse } from "next/server";
import {
  verifyCartAgainstSqlite,
  generateGatewayOrderId,
  logPaymentInMongo,
} from "@/lib/payment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cartItems = [],
      discountCode,
      paymentMethod = "upi",
      userId = 1,
    } = body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty. Please add items before initiating payment." },
        { status: 400 }
      );
    }

    // 1. Strict Server-Side Verification Against SQLite records
    const verified = verifyCartAgainstSqlite(cartItems, discountCode);
    if (!verified.valid) {
      return NextResponse.json({ error: verified.error }, { status: 400 });
    }

    // 2. Generate Razorpay / Stripe Order ID
    const gatewayOrderId = generateGatewayOrderId(
      paymentMethod === "card" ? "pi" : "order_rzp"
    );

    // 3. Log initial transaction in MongoDB
    await logPaymentInMongo({
      orderId: gatewayOrderId,
      amount: verified.finalTotal,
      subtotal: verified.subtotal,
      discountAmount: verified.discountAmount,
      discountCode: verified.discountCode,
      paymentMethod,
      items: verified.items.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        unitPrice: i.product.price,
        quantity: i.quantity,
      })),
      status: paymentMethod === "cod" ? "cod_pending" : "created",
    });

    return NextResponse.json({
      success: true,
      orderId: gatewayOrderId,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_cartwise_sandbox",
      currency: "INR",
      amount: verified.finalTotal,
      amountInPaise: Math.round(verified.finalTotal * 100),
      paymentMethod,
      verifiedSummary: {
        itemsCount: verified.items.reduce((s, i) => s + i.quantity, 0),
        subtotal: verified.subtotal,
        discountAmount: verified.discountAmount,
        discountPercentage: verified.discountPercentage,
        discountCode: verified.discountCode,
        finalTotal: verified.finalTotal,
      },
    });
  } catch (error: any) {
    console.error("Create payment order failed:", error);
    return NextResponse.json(
      { error: error?.message || "Internal payment error" },
      { status: 500 }
    );
  }
}
