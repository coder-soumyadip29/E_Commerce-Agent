import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminSessionToken, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";
import {
  getDashboardMetricsDb,
  getAnalyticsChartDataDb,
  getAdminOrdersDb,
  getSellersDb,
  getAdminProductsDb,
  getPayoutsDb,
} from "@/lib/adminDb";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const admin = verifyAdminSessionToken(token);

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "30days";

    const metrics = getDashboardMetricsDb();
    const chartData = getAnalyticsChartDataDb(range);
    const recentOrders = getAdminOrdersDb().slice(0, 6);
    const recentSellers = getSellersDb().slice(0, 5);
    const pendingProducts = getAdminProductsDb({ approval_status: "PENDING_APPROVAL" });
    const pendingPayouts = getPayoutsDb({ status: "PENDING" });

    return NextResponse.json({
      success: true,
      metrics,
      chartData,
      recentOrders,
      recentSellers,
      pendingProducts,
      pendingPayouts,
    });
  } catch (err: any) {
    console.error("Admin dashboard API error:", err);
    return NextResponse.json({ error: err.message || "Failed to load dashboard metrics" }, { status: 500 });
  }
}
