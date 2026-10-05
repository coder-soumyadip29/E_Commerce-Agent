import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { reorderDb } from "@/lib/db";

async function getSessionId() {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("cartwise_session")?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    cookieStore.set("cartwise_session", sessionId, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  }
  return sessionId;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = await getSessionId();
    const resolvedParams = await params;
    const orderId = Number(resolvedParams.id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const res = reorderDb(sessionId, orderId);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Reorder failed:", error);
    return NextResponse.json({ error: error?.message || "Reorder failed" }, { status: 500 });
  }
}
