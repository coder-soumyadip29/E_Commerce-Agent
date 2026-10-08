import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  getSellers,
  getSellerById,
  updateSellerStatus,
  updateSellerCommission,
  updateSeller,
  addAuditLog,
} from "@/lib/adminDb";
import { Seller } from "@/lib/types";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.toLowerCase();

  let sellers = getSellers();

  if (status && status !== "ALL") {
    sellers = sellers.filter((s) => s.status === status);
  }

  if (search) {
    sellers = sellers.filter(
      (s) =>
        s.business_name.toLowerCase().includes(search) ||
        s.legal_name.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        s.id.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({
    sellers,
    total: sellers.length,
    counts: {
      all: getSellers().length,
      active: getSellers().filter((s) => s.status === "ACTIVE").length,
      pending: getSellers().filter((s) => s.status === "PENDING").length,
      suspended: getSellers().filter((s) => s.status === "SUSPENDED").length,
      rejected: getSellers().filter((s) => s.status === "REJECTED").length,
    },
  });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, seller_id, status, commission_rate, reason, updates } = body;

    if (!seller_id) {
      return NextResponse.json({ error: "Missing seller_id" }, { status: 400 });
    }

    const seller = getSellerById(seller_id);
    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    if (action === "update_status") {
      updateSellerStatus(seller_id, status, reason);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "UPDATE_SELLER_STATUS",
        entity_type: "SELLER",
        entity_id: seller_id,
        details: `Updated status of ${seller.business_name} to ${status}. Reason: ${reason || "N/A"}`,
      });
      return NextResponse.json({ success: true, seller: getSellerById(seller_id) });
    }

    if (action === "update_commission") {
      updateSellerCommission(seller_id, Number(commission_rate));
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "UPDATE_SELLER_COMMISSION",
        entity_type: "SELLER",
        entity_id: seller_id,
        details: `Updated custom commission rate of ${seller.business_name} to ${commission_rate}%`,
      });
      return NextResponse.json({ success: true, seller: getSellerById(seller_id) });
    }

    if (action === "update_details" && updates) {
      updateSeller(seller_id, updates);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "UPDATE_SELLER_DETAILS",
        entity_type: "SELLER",
        entity_id: seller_id,
        details: `Updated profile details of ${seller.business_name}`,
      });
      return NextResponse.json({ success: true, seller: getSellerById(seller_id) });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 });
  }
}
