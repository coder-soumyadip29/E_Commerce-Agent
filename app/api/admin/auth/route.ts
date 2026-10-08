import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  authenticateAdminCredentials,
  verifyAdminSessionToken,
  revokeAdminSession,
  ADMIN_COOKIE_NAME,
} from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    const admin = verifyAdminSessionToken(token);
    if (!admin) {
      return NextResponse.json({ authenticated: false, error: "Not logged in" }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: admin,
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action = "login", email, password } = body;

    if (action === "logout") {
      const cookieStore = await cookies();
      const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
      if (token) {
        revokeAdminSession(token);
      }
      cookieStore.delete(ADMIN_COOKIE_NAME);

      return NextResponse.json({ success: true, message: "Logged out successfully" });
    }

    if (action === "login") {
      const res = authenticateAdminCredentials(email, password);
      if (!res.success || !res.token) {
        return NextResponse.json({ success: false, error: res.error || "Authentication failed" }, { status: 401 });
      }

      const cookieStore = await cookies();
      cookieStore.set(ADMIN_COOKIE_NAME, res.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return NextResponse.json({
        success: true,
        user: res.user,
        message: `Welcome back, ${res.user?.name}`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Admin login error" }, { status: 500 });
  }
}
