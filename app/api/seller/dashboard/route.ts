import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSellerFromRequest } from "@/lib/sellerAuth";
import { getSellerDashboardMetrics } from "@/lib/sellerDb";

export async function GET(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized seller session." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get("timeframe") || "30d";

    const dashboardData = getSellerDashboardMetrics(seller.id, timeframe);

    return NextResponse.json({
      success: true,
      seller: {
        id: seller.id,
        store_name: seller.store_name,
        owner_name: seller.owner_name,
        status: seller.status,
        rating: seller.rating,
        commission_rate: seller.commission_rate,
      },
      ...dashboardData,
    });
  } catch (error: any) {
    console.error("Seller Dashboard API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load dashboard." }, { status: 500 });
  }
}
