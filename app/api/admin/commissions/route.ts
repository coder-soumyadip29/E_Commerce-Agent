import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  getCommissionConfig,
  updateCommissionConfig,
  getCategories,
  getSellers,
  updateCategory,
  updateSellerCommission,
  addAuditLog,
} from "@/lib/adminDb";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getCommissionConfig();
  const categories = getCategories();
  const sellers = getSellers();

  return NextResponse.json({
    config,
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      commission_rate: c.commission_rate,
    })),
    sellers: sellers.map((s) => ({
      id: s.id,
      name: s.business_name,
      commission_rate: s.commission_rate,
      total_sales: s.total_sales,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, default_rate, category_id, seller_id, rate } = body;

    if (action === "update_default" && default_rate !== undefined) {
      updateCommissionConfig({ default_rate: Number(default_rate) });
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "UPDATE_COMMISSION_RULE",
        entity_type: "COMMISSION",
        entity_id: "global",
        details: `Updated default marketplace commission to ${default_rate}%`,
      });
      return NextResponse.json({ success: true, config: getCommissionConfig() });
    }

    if (action === "update_category" && category_id && rate !== undefined) {
      updateCategory(category_id, { commission_rate: Number(rate) });
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "UPDATE_COMMISSION_RULE",
        entity_type: "CATEGORY",
        entity_id: category_id,
        details: `Updated category commission rate to ${rate}%`,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "update_seller" && seller_id && rate !== undefined) {
      updateSellerCommission(seller_id, Number(rate));
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "UPDATE_COMMISSION_RULE",
        entity_type: "SELLER",
        entity_id: seller_id,
        details: `Updated seller custom commission rate to ${rate}%`,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
