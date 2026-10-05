import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkoutCartDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cartwise_session")?.value;
    if (!sessionId) {
      return NextResponse.json({ error: "Session not found. Cart is empty." }, { status: 400 });
    }

    const res = checkoutCartDb(sessionId);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: res.order });
  } catch (error: any) {
    console.error("Checkout failed:", error);
    return NextResponse.json({ error: error?.message || "Checkout failed" }, { status: 500 });
  }
}
