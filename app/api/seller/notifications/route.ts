import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSellerFromRequest } from "@/lib/sellerAuth";
import { getSellerNotifications, markSellerNotificationRead } from "@/lib/sellerDb";

export async function GET(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized. Please log in as a seller." }, { status: 401 });
    }

    const notifications = getSellerNotifications(seller.id);

    return NextResponse.json({
      notifications,
    });
  } catch (error: any) {
    console.error("Seller notifications error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized. Please log in as a seller." }, { status: 401 });
    }

    const body = await req.json();
    const { notification_id, mark_all } = body;

    if (mark_all) {
      const notifications = getSellerNotifications(seller.id);
      notifications.forEach((n) => (n.is_read = true));
      return NextResponse.json({ message: "All notifications marked as read" });
    }

    if (!notification_id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    markSellerNotificationRead(seller.id, Number(notification_id));

    return NextResponse.json({ message: "Notification marked as read" });
  } catch (error: any) {
    console.error("Seller mark notification error:", error);
    return NextResponse.json({ error: error.message || "Failed to update notification" }, { status: 500 });
  }
}
