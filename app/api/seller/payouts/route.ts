import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSellerFromRequest } from "@/lib/sellerAuth";
import { getSellerPayouts, getSellerEarningsSummary, requestSellerPayout } from "@/lib/sellerDb";

export async function GET(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized. Please log in as a seller." }, { status: 401 });
    }

    const payouts = getSellerPayouts(seller.id);
    const summary = getSellerEarningsSummary(seller.id);

    return NextResponse.json({
      payouts,
      summary,
    });
  } catch (error: any) {
    console.error("Seller payouts error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch payouts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized. Please log in as a seller." }, { status: 401 });
    }

    const body = await req.json();
    const amount = Number(body.amount);
    const notes = body.notes;

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Please provide a valid withdrawal amount." }, { status: 400 });
    }

    const result = requestSellerPayout(seller.id, amount, notes);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: "Payout request submitted successfully. Awaiting admin settlement.",
      payout: result.payout,
    });
  } catch (error: any) {
    console.error("Seller payout request error:", error);
    return NextResponse.json({ error: error.message || "Failed to request payout" }, { status: 500 });
  }
}
