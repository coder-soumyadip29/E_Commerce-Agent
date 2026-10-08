import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  addAuditLog,
} from "@/lib/adminDb";
import { Category } from "@/lib/types";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = getCategories();
  const products = getProducts();

  // Attach live product count to each category
  const categoriesWithCounts = categories.map((cat) => {
    const productCount = products.filter(
      (p) => p.category?.toLowerCase() === cat.slug.toLowerCase() || p.category?.toLowerCase() === cat.name.toLowerCase()
    ).length;
    return {
      ...cat,
      product_count: productCount,
    };
  });

  return NextResponse.json({
    categories: categoriesWithCounts,
    total: categoriesWithCounts.length,
  });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, category, id, updates } = body;

    if (action === "create" && category) {
      const newCat: Category = {
        id: Date.now(),
        name: category.name,
        slug: category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: category.description || "",
        commission_rate: Number(category.commission_rate) || 10,
        status: category.is_active !== false ? "ACTIVE" : "INACTIVE",
        display_order: Number(category.sort_order) || 0,
        sub_categories: category.subcategories || [],
      };
      addCategory(newCat);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "CREATE_CATEGORY",
        entity_type: "CATEGORY",
        entity_id: newCat.id,
        details: `Created category ${newCat.name} with ${newCat.commission_rate}% commission`,
      });
      return NextResponse.json({ success: true, category: newCat });
    }

    if (action === "update" && id && updates) {
      updateCategory(id, updates);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "UPDATE_CATEGORY",
        entity_type: "CATEGORY",
        entity_id: id,
        details: `Updated category details for ${id}`,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "delete" && id) {
      deleteCategory(id);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "DELETE_CATEGORY",
        entity_type: "CATEGORY",
        entity_id: id,
        details: `Deleted category ${id}`,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
