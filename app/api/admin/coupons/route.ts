import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  getCoupons,
  addCoupon,
  toggleCouponActive,
  deleteCoupon,
  addAuditLog,
} from "@/lib/adminDb";
import { Coupon } from "@/lib/types";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const coupons = getCoupons();
  return NextResponse.json({ coupons, total: coupons.length });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, coupon, id } = body;

    if (action === "create" && coupon) {
      const newCoupon: Coupon = {
        id: Date.now(),
        code: coupon.code.toUpperCase().trim(),
        discount_type: coupon.discount_type === "FIXED" ? "FIXED_AMOUNT" : "PERCENTAGE",
        discount_value: Number(coupon.discount_value),
        min_order: Number(coupon.min_order_value || 0),
        max_discount: coupon.max_discount ? Number(coupon.max_discount) : undefined,
        start_date: coupon.start_date || new Date().toISOString(),
        end_date: coupon.expiry_date || new Date(Date.now() + 30 * 86400000).toISOString(),
        usage_limit: Number(coupon.usage_limit || 100),
        used_count: 0,
        status: "ACTIVE",
      };

      addCoupon(newCoupon);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "CREATE_COUPON",
        entity_type: "COUPON",
        entity_id: newCoupon.id,
        details: `Created coupon code ${newCoupon.code}`,
      });
      return NextResponse.json({ success: true, coupon: newCoupon });
    }

    if (action === "toggle" && id) {
      toggleCouponActive(id);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "TOGGLE_COUPON",
        entity_type: "COUPON",
        entity_id: id,
        details: `Toggled active state for coupon ${id}`,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "delete" && id) {
      deleteCoupon(id);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "DELETE_COUPON",
        entity_type: "COUPON",
        entity_id: id,
        details: `Deleted coupon ${id}`,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
