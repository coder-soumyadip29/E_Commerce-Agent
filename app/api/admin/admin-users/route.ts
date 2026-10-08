import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import {
  getAdminUsers,
  addAdminUser,
  updateAdminUserRole,
  toggleAdminUserActive,
  addAuditLog,
} from "@/lib/adminDb";
import { AdminUser } from "@/lib/types";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = getAdminUsers();
  return NextResponse.json({ users, total: users.length });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only SUPER_ADMIN can manage other admin accounts
  if (session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { action, user, id, role, permissions } = body;

    if (action === "create" && user) {
      const newUser: AdminUser = {
        id: Date.now(),
        name: user.name,
        email: user.email.toLowerCase().trim(),
        role: user.role || "ADMIN",
        permissions: user.permissions || ["*"],
        status: "ACTIVE",
        created_at: new Date().toISOString(),
      };

      addAdminUser(newUser);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "CREATE_ADMIN_USER",
        entity_type: "ADMIN_USER",
        entity_id: newUser.id,
        details: `Created admin user ${newUser.name} (${newUser.role})`,
      });
      return NextResponse.json({ success: true, user: newUser });
    }

    if (action === "update_role" && id && role) {
      updateAdminUserRole(id, role, permissions || ["*"]);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "UPDATE_ADMIN_ROLE",
        entity_type: "ADMIN_USER",
        entity_id: id,
        details: `Updated role of admin ${id} to ${role}`,
      });
      return NextResponse.json({ success: true });
    }

    if (action === "toggle" && id) {
      toggleAdminUserActive(id);
      addAuditLog({
        admin_id: session.id,
        admin_name: session.name,
        action: "TOGGLE_ADMIN_STATUS",
        entity_type: "ADMIN_USER",
        entity_id: id,
        details: `Toggled active state of admin ${id}`,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed" }, { status: 500 });
  }
}
