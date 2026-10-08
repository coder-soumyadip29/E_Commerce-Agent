import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSellerFromRequest } from "@/lib/sellerAuth";
import { getSellerCoupons, createSellerCoupon, toggleSellerCoupon } from "@/lib/sellerDb";

export async function GET(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized. Please log in as a seller." }, { status: 401 });
    }

    const coupons = getSellerCoupons(seller.id);

    return NextResponse.json({
      coupons,
    });
  } catch (error: any) {
    console.error("Seller coupons error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized. Please log in as a seller." }, { status: 401 });
    }

    const body = await req.json();
    const result = createSellerCoupon(seller.id, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: "Store coupon created successfully",
      coupon: result.coupon,
    });
  } catch (error: any) {
    console.error("Create seller coupon error:", error);
    return NextResponse.json({ error: error.message || "Failed to create coupon" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized. Please log in as a seller." }, { status: 401 });
    }

    const body = await req.json();
    const { coupon_id } = body;

    if (!coupon_id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    const result = toggleSellerCoupon(seller.id, coupon_id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: "Coupon status updated successfully",
    });
  } catch (error: any) {
    console.error("Toggle coupon error:", error);
    return NextResponse.json({ error: error.message || "Failed to toggle coupon status" }, { status: 500 });
  }
}
