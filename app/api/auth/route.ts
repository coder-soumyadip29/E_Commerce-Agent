import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, loginUser, registerUser } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("userId");
    const userId = userIdParam ? Number(userIdParam) : 1;

    const user = getUserProfile(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name, dietaryTags } = body;

    if (action === "login") {
      const result = loginUser(email, password);
      if (!result.success) {
        return NextResponse.json({ error: result.error || "Authentication failed" }, { status: 400 });
      }
      return NextResponse.json({ success: true, user: result.user });
    }

    if (action === "register") {
      const result = registerUser(name, email, password, dietaryTags);
      if (!result.success) {
        return NextResponse.json({ error: result.error || "Registration failed" }, { status: 400 });
      }
      return NextResponse.json({ success: true, user: result.user });
    }

    return NextResponse.json({ error: "Invalid action. Use 'login' or 'register'." }, { status: 400 });
  } catch (error) {
    console.error("Auth POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
