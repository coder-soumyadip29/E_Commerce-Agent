import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSellerFromRequest } from "@/lib/sellerAuth";
import { getSellerReviews, replySellerReview } from "@/lib/sellerDb";

export async function GET(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized. Please log in as a seller." }, { status: 401 });
    }

    const reviews = getSellerReviews(seller.id);

    return NextResponse.json({
      reviews,
    });
  } catch (error: any) {
    console.error("Seller reviews error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);
    if (!seller) {
      return NextResponse.json({ error: "Unauthorized. Please log in as a seller." }, { status: 401 });
    }

    const body = await req.json();
    const { review_id, reply_text } = body;

    if (!review_id || !reply_text?.trim()) {
      return NextResponse.json({ error: "Review ID and reply text are required" }, { status: 400 });
    }

    const result = replySellerReview(seller.id, Number(review_id), reply_text);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      message: "Merchant reply posted successfully",
    });
  } catch (error: any) {
    console.error("Seller reply review error:", error);
    return NextResponse.json({ error: error.message || "Failed to post reply" }, { status: 500 });
  }
}
