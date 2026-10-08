import { NextRequest, NextResponse } from "next/server";
import { getPublicStoreBySlug } from "@/lib/sellerDb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const store = getPublicStoreBySlug(slug);

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, store });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
