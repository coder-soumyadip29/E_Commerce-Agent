import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  getPlatformSettings,
  updatePlatformSettings,
  addAuditLog,
} from "@/lib/adminDb";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = getPlatformSettings();
  return NextResponse.json({ settings });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { updates } = body;

    if (!updates) {
      return NextResponse.json({ error: "Missing updates" }, { status: 400 });
    }

    updatePlatformSettings(updates);
    addAuditLog({
      admin_id: session.id,
      admin_name: session.name,
      action: "UPDATE_PLATFORM_SETTINGS",
      entity_type: "SETTINGS",
      entity_id: "global",
      details: "Updated marketplace platform parameters and operational policies",
    });

    return NextResponse.json({ success: true, settings: getPlatformSettings() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
