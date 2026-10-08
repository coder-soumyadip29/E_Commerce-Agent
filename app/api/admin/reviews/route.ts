import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  getReviews,
  updateReviewStatus,
  deleteReview,
  addAuditLog,
} from "@/lib/adminDb";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const rating = searchParams.get("rating");

  let reviews = getReviews();

  if (status && status !== "ALL") {
    reviews = reviews.filter((r) => r.status === status);
  }

  if (rating && rating !== "ALL") {
    reviews = reviews.filter((r) => r.rating === parseInt(rating));
  }

  return NextResponse.json({
    reviews,
    total: reviews.length,
    counts: {
      all: getReviews().length,
      pending: getReviews().filter((r) => r.status === "PENDING").length,
      approved: getReviews().filter((r) => r.status === "APPROVED").length,
      rejected: getReviews().filter((r) => r.status === "REJECTED").length,
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
    const { action, review_id, status } = body;

    if (action === "update_status" && review_id && status) {
      updateReviewStatus(review_id, status);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "MODERATE_REVIEW",
        entity_type: "REVIEW",
        entity_id: review_id,
        details: `Updated review status to ${status}`,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "delete" && review_id) {
      deleteReview(review_id);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "DELETE_REVIEW",
        entity_type: "REVIEW",
        entity_id: review_id,
        details: `Deleted review`,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
