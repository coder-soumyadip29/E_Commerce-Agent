import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSellerFromRequest } from "@/lib/sellerAuth";
import { getSellerInventory, updateSellerStock } from "@/lib/sellerDb";

export async function GET(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized seller session." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const filter = (searchParams.get("filter") as any) || "ALL";

    // STRICT OWNERSHIP ENFORCEMENT
    const inventory = getSellerInventory(seller.id, { search, filter });

    return NextResponse.json({ success: true, inventory });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized seller session." }, { status: 401 });
    }

    const body = await req.json();
    const { productId, stock } = body;

    if (!productId || stock === undefined) {
      return NextResponse.json({ error: "Product ID and stock are required." }, { status: 400 });
    }

    if (Number(stock) < 0) {
      return NextResponse.json({ error: "Stock cannot be negative." }, { status: 400 });
    }

    // STRICT IDOR CHECK
    const res = updateSellerStock(seller.id, Number(productId), Number(stock));

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Inventory stock updated." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
