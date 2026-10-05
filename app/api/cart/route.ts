import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCartDb, addToCartDb, updateCartQuantityDb, deleteCartDb } from "@/lib/db";

async function getOrCreateSessionId(): Promise<{ sessionId: string; isNew: boolean }> {
  const cookieStore = await cookies();
  const existing = cookieStore.get("cartwise_session")?.value;
  if (existing) {
    return { sessionId: existing, isNew: false };
  }
  return { sessionId: crypto.randomUUID(), isNew: true };
}

export async function GET() {
  try {
    const { sessionId, isNew } = await getOrCreateSessionId();
    const enrichedCart = getCartDb(sessionId);

    const response = NextResponse.json({ success: true, cart: enrichedCart });
    if (isNew) {
      response.cookies.set("cartwise_session", sessionId, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    }
    return response;
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return NextResponse.json({ error: "Failed to retrieve cart" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId, isNew } = await getOrCreateSessionId();
    const body = await req.json();
    const productId = Number(body.productId);
    const quantity = Number(body.quantity) || 1;

    if (!productId) {
      return NextResponse.json({ error: "Valid productId required" }, { status: 400 });
    }

    const res = addToCartDb(sessionId, productId, quantity);
    if (!res.success) {
      return NextResponse.json({ error: res.message }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    if (isNew) {
      response.cookies.set("cartwise_session", sessionId, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    }
    return response;
  } catch (error: any) {
    console.error("Failed to add to cart:", error);
    return NextResponse.json({ error: error?.message || "Failed to add to cart" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { sessionId, isNew } = await getOrCreateSessionId();
    const body = await req.json();
    const productId = Number(body.productId);
    const quantity = Number(body.quantity);

    if (!productId || isNaN(quantity)) {
      return NextResponse.json({ error: "Valid productId and quantity required" }, { status: 400 });
    }

    const res = updateCartQuantityDb(sessionId, productId, quantity);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });
    if (isNew) {
      response.cookies.set("cartwise_session", sessionId, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    }
    return response;
  } catch (error: any) {
    console.error("Failed to update cart:", error);
    return NextResponse.json({ error: error?.message || "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { sessionId, isNew } = await getOrCreateSessionId();
    const url = new URL(req.url);
    const productIdStr = url.searchParams.get("productId");

    deleteCartDb(sessionId, productIdStr ? Number(productIdStr) : undefined);

    const response = NextResponse.json({ success: true });
    if (isNew) {
      response.cookies.set("cartwise_session", sessionId, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    }
    return response;
  } catch (error: any) {
    console.error("Failed to delete cart items:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete cart items" }, { status: 500 });
  }
}
