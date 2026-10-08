import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSellerFromRequest } from "@/lib/sellerAuth";
import { getSellerStoreProfile, updateSellerStoreProfile } from "@/lib/sellerDb";

export async function GET(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized seller session." }, { status: 401 });
    }

    const profile = getSellerStoreProfile(seller.id);
    return NextResponse.json({ success: true, store: profile });
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
    const res = updateSellerStoreProfile(seller.id, body);

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, store: res.seller });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
