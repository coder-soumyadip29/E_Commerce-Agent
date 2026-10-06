import { NextRequest, NextResponse } from "next/server";
import {
  getUserProfile,
  loginUser,
  registerUser,
  verifyUserEmail,
  resendVerificationCode,
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
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name, dietaryTags, code } = body;

    if (action === "login") {
      const result = await loginUser(email, password);
      if (!result.success) {
        return NextResponse.json(
          {
            error: result.error || "Authentication failed",
            needsVerification: result.needsVerification,
            user: result.user,
          },
          { status: result.needsVerification ? 200 : 400 }
        );
      }
      return NextResponse.json({ success: true, user: result.user });
    }

    if (action === "register") {
      const result = await registerUser(name, email, password, dietaryTags);
      if (!result.success) {
        return NextResponse.json({ error: result.error || "Registration failed" }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        user: result.user,
        verificationCode: result.verificationCode,
        devMode: result.devMode,
      });
    }

    if (action === "verify") {
      const result = await verifyUserEmail(email, code);
      if (!result.success) {
        return NextResponse.json({ error: result.error || "Verification failed" }, { status: 400 });
      }
      return NextResponse.json({ success: true, user: result.user });
    }

    if (action === "resend") {
      const result = await resendVerificationCode(email);
      if (!result.success) {
        return NextResponse.json({ error: result.error || "Failed to resend code" }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        code: result.code,
        devMode: result.devMode,
        message: "A fresh verification code has been generated and sent.",
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Supported: 'login', 'register', 'verify', 'resend'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Auth POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
