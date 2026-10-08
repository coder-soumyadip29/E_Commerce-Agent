import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { getCustomers } from "@/lib/adminDb";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase();

  let customers = getCustomers();

  if (search) {
    customers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.id.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({
    customers,
    total: customers.length,
  });
}
