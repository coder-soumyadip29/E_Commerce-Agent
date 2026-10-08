import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSellerFromRequest } from "@/lib/sellerAuth";
import { getSellerEarningsSummary, getSellerCommissions } from "@/lib/sellerDb";

export async function GET(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized. Please log in as a seller." }, { status: 401 });
    }

    const summary = getSellerEarningsSummary(seller.id);
    const commissions = getSellerCommissions(seller.id);

    return NextResponse.json({
      summary,
      commissions,
    });
  } catch (error: any) {
    console.error("Seller earnings error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch earnings" }, { status: 500 });
  }
}
