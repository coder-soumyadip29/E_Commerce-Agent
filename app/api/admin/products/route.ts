import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  getProducts,
  updateProductStatus,
  updateProductStock,
  updateProduct,
  addProduct,
  addAuditLog,
  getSellers,
} from "@/lib/adminDb";
import { Product } from "@/lib/types";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const sellerId = searchParams.get("seller_id");
  const category = searchParams.get("category");
  const search = searchParams.get("search")?.toLowerCase();

  let products = getProducts();

  if (status && status !== "ALL") {
    products = products.filter(
      (p) => p.approval_status === status || p.status === status
    );
  }

  if (sellerId && sellerId !== "ALL") {
    products = products.filter((p) => p.seller_id === sellerId);
  }

  if (category && category !== "ALL") {
    products = products.filter(
      (p) => p.category?.toLowerCase() === category.toLowerCase()
    );
  }

  if (search) {
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search) ||
        p.sku?.toLowerCase().includes(search) ||
        p.seller_name?.toLowerCase().includes(search)
    );
  }

  const allProducts = getProducts();
  const counts = {
    all: allProducts.length,
    active: allProducts.filter((p) => p.approval_status === "APPROVED" || p.status === "ACTIVE").length,
    pending: allProducts.filter((p) => p.approval_status === "PENDING_APPROVAL").length,
    low_stock: allProducts.filter((p) => (p.stock ?? 0) <= 10 && (p.stock ?? 0) > 0).length,
    out_of_stock: allProducts.filter((p) => (p.stock ?? 0) === 0).length,
  };

  return NextResponse.json({
    products,
    total: products.length,
    counts,
    sellers: getSellers().map((s) => ({ id: s.id, name: s.business_name })),
  });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, product_id, status, reason, stock, updates, product } = body;

    if (action === "update_status" && product_id) {
      updateProductStatus(product_id, status, reason);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "UPDATE_PRODUCT_STATUS",
        entity_type: "PRODUCT",
        entity_id: product_id,
        details: `Updated product status to ${status}. Reason: ${reason || "N/A"}`,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "update_stock" && product_id) {
      updateProductStock(product_id, Number(stock));
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "UPDATE_PRODUCT_STOCK",
        entity_type: "PRODUCT",
        entity_id: product_id,
        details: `Updated stock level to ${stock} units`,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "update" && product_id && updates) {
      updateProduct(product_id, updates);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "UPDATE_PRODUCT",
        entity_type: "PRODUCT",
        entity_id: product_id,
        details: `Updated product attributes`,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "create" && product) {
      addProduct(product);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "CREATE_PRODUCT",
        entity_type: "PRODUCT",
        entity_id: product.id,
        details: `Admin created product ${product.name}`,
      });
      return NextResponse.json({ success: true, product });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
