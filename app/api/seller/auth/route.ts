import { NextRequest, NextResponse } from "next/server";
import {
  authenticateSellerCredentials,
  getAuthenticatedSellerFromRequest,
  revokeSellerSessionToken,
  SELLER_COOKIE_NAME,
} from "@/lib/sellerAuth";
import { getSellersDb, createSellerDb } from "@/lib/adminDb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, email, password } = body;

    // Handle new seller registration / onboarding
    if (action === "register") {
      const { store_name, owner_name, phone, business_address, tax_id } = body;

      if (!store_name || !email || !owner_name || !phone) {
        return NextResponse.json(
          { error: "Store name, owner name, email, and phone are required." },
          { status: 400 }
        );
      }

      const existing = getSellersDb().find(
        (s) => s.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (existing) {
        return NextResponse.json(
          { error: "A seller account with this email already exists." },
          { status: 400 }
        );
      }

      const res = createSellerDb({
        user_id: Date.now(),
        store_name: store_name.trim(),
        owner_name: owner_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        business_address: business_address?.trim() || "",
        tax_id: tax_id?.trim() || "",
        commission_rate: 10.0,
      });

      if (!res.success || !res.seller) {
        return NextResponse.json({ error: res.error || "Registration failed." }, { status: 400 });
      }

      // Automatically authenticate the newly registered seller
      const auth = authenticateSellerCredentials(res.seller.email, "Seller@12345");
      const response = NextResponse.json({
        success: true,
        seller: res.seller,
        message: "Seller registered successfully. Account is currently under review.",
      });

      if (auth.token) {
        response.cookies.set({
          name: SELLER_COOKIE_NAME,
          value: auth.token,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 24 * 60 * 60,
        });
      }

      return response;
    }

    // Default: Authenticate existing seller credentials
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const authResult = authenticateSellerCredentials(email, password);

    if (!authResult.success || !authResult.seller) {
      return NextResponse.json(
        { error: authResult.error || "Authentication failed." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      seller: authResult.seller,
      message: `Welcome to your vendor dashboard, ${authResult.seller.store_name}`,
    });

    response.cookies.set({
      name: SELLER_COOKIE_NAME,
      value: authResult.token!,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("Seller Auth Error:", error);
    return NextResponse.json({ error: "Internal server error during authentication." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const seller = getAuthenticatedSellerFromRequest(req);

    if (!seller) {
      return NextResponse.json({ authenticated: false, error: "Unauthorized session." }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      seller,
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get(SELLER_COOKIE_NAME)?.value;
    revokeSellerSessionToken(token);

    const response = NextResponse.json({ success: true, message: "Logged out successfully." });
    response.cookies.delete(SELLER_COOKIE_NAME);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
