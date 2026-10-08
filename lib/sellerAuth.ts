import { NextRequest, NextResponse } from "next/server";
import { Seller } from "./types";
import { getSellersDb, getSellerByIdDb } from "./adminDb";
import { hashPassword, verifyPassword } from "./email";
import crypto from "crypto";

export const SELLER_COOKIE_NAME = "cartwise_seller_token";

// In-memory active seller sessions: token -> { sellerId: number; expiresAt: number }
const activeSellerSessions = new Map<string, { sellerId: number; expiresAt: number }>();

// Pre-seeded hashed password for all demo sellers: "Seller@12345"
const SELLER_DEFAULT_PASSWORD_HASH = hashPassword("Seller@12345");

export function authenticateSellerCredentials(
  email: string,
  password: string
): { success: boolean; seller?: Seller; token?: string; error?: string } {
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPassword = (password || "").trim();

  const allSellers = getSellersDb();
  const seller = allSellers.find((s) => s.email.toLowerCase() === cleanEmail);

  if (!seller) {
    return { success: false, error: "Invalid seller email or store not found." };
  }

  // Password verification: matches default "Seller@12345" or hashed check
  const isValid =
    cleanPassword === "Seller@12345" ||
    verifyPassword(cleanPassword, SELLER_DEFAULT_PASSWORD_HASH.hash, SELLER_DEFAULT_PASSWORD_HASH.salt);

  if (!isValid) {
    return { success: false, error: "Incorrect password." };
  }

  // Note: we still authenticate suspended / pending sellers so they can access their account
  // status screen (e.g. "Your account is under review" or "Your account is suspended").

  const token = `sel_tok_${crypto.randomBytes(32).toString("hex")}`;
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  activeSellerSessions.set(token, { sellerId: seller.id, expiresAt });

  return { success: true, seller, token };
}

export function verifySellerSessionToken(token?: string | null): Seller | null {
  if (!token) return null;

  // Development bypass helper
  if (token === "dev_seller_1_session") {
    return getSellerByIdDb(1) || null;
  }

  const session = activeSellerSessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    activeSellerSessions.delete(token);
    return null;
  }

  return getSellerByIdDb(session.sellerId) || null;
}

export function getAuthenticatedSellerFromRequest(req: NextRequest): Seller | null {
  const cookieToken = req.cookies.get(SELLER_COOKIE_NAME)?.value;
  if (cookieToken) {
    const seller = verifySellerSessionToken(cookieToken);
    if (seller) return seller;
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const bearerToken = authHeader.substring(7);
    const seller = verifySellerSessionToken(bearerToken);
    if (seller) return seller;
  }

  return null;
}

export function revokeSellerSessionToken(token?: string | null): void {
  if (token) {
    activeSellerSessions.delete(token);
  }
}
