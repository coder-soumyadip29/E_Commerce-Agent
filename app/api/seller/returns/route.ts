import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSellerFromRequest } from "@/lib/sellerAuth";
import { getSellerReturns, updateSellerReturn } from "@/lib/sellerDb";

export async function GET(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized seller session." }, { status: 401 });
    }

    // STRICT OWNERSHIP
    const returns = getSellerReturns(seller.id);
    return NextResponse.json({ success: true, returns });
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
    const { returnId, status, notes } = body;

    if (!returnId || !status) {
      return NextResponse.json({ error: "Return ID and status are required." }, { status: 400 });
    }

    // STRICT IDOR CHECK
    const res = updateSellerReturn(seller.id, Number(returnId), status, notes);

    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Return request status updated." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
