import { NextRequest, NextResponse } from "next/server";
import {
  getUserProfile,
  updateUserPreferences,
  getPersonalizedProducts,
} from "@/lib/userDb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("userId");
    const userId = userIdParam ? Number(userIdParam) : 1;

    const user = await getUserProfile(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const personalizedProducts = await getPersonalizedProducts(userId);
    return NextResponse.json({
      success: true,
      preferences: user.preferences,
      personalizedProducts,
    });
  } catch (error) {
    console.error("Preferences GET error:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = 1, preferences } = body;

    if (!preferences) {
      return NextResponse.json({ error: "Preferences object required" }, { status: 400 });
    }

    const result = await updateUserPreferences(Number(userId), preferences);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to update preferences" }, { status: 400 });
    }

    const personalizedProducts = await getPersonalizedProducts(Number(userId));
    return NextResponse.json({
      success: true,
      user: result.user,
      preferences: result.user?.preferences,
      personalizedProducts,
    });
  } catch (error) {
    console.error("Preferences POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
