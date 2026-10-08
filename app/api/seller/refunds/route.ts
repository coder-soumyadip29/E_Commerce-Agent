import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSellerFromRequest } from "@/lib/sellerAuth";
import { getSellerRefunds } from "@/lib/sellerDb";

export async function GET(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized. Please log in as a seller." }, { status: 401 });
    }

    const refunds = getSellerRefunds(seller.id);

    return NextResponse.json({
      refunds,
    });
  } catch (error: any) {
    console.error("Seller refunds error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch refunds" }, { status: 500 });
  }
}
