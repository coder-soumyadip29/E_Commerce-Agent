import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { connectToDatabase } from "../lib/mongodb";
import { UserModel } from "../lib/models/User";
import {
  registerUser,
  loginUser,
  searchAccountByEmail,
  sendPasswordResetOtp,
  resetPasswordWithOtp,
} from "../lib/userDb";
import { NextRequest } from "next/server";
import { POST } from "../app/api/auth/route";

describe("Facebook-Style Forgot Password Flow", () => {
  const testEmail = `fb_recovery_${Date.now()}@example.com`;
  const initialPassword = "InitialPassword123!";
  const updatedPassword = "BrandNewSecurePassword456!";
  let resetCode = "";

  beforeAll(async () => {
    await connectToDatabase();
    await UserModel.deleteOne({ email: testEmail });

    // Register test account
    const regRes = await registerUser("Maya Sterling", testEmail, initialPassword);
    expect(regRes.success).toBe(true);

    // Auto-verify so the account is active
    await UserModel.updateOne({ email: testEmail }, { isVerified: true });
  });

  afterAll(async () => {
    await UserModel.deleteOne({ email: testEmail });
  });

  describe("Step 1: Account Search (Facebook-style)", () => {
    it("finds the registered account and masks email for privacy", async () => {
      const res = await searchAccountByEmail(testEmail);
      expect(res.success).toBe(true);
      expect(res.found).toBe(true);
      expect(res.account).toBeDefined();
      expect(res.account?.name).toBe("Maya Sterling");
      expect(res.account?.email).toBe(testEmail);
      expect(res.account?.maskedEmail).toMatch(/\*+/);
      expect(res.account?.maskedEmail).not.toBe(testEmail);
    });

    it("handles whitespace and case-insensitive search gracefully", async () => {
      const res = await searchAccountByEmail(`   ${testEmail.toUpperCase()}   `);
      expect(res.success).toBe(true);
      expect(res.found).toBe(true);
      expect(res.account?.name).toBe("Maya Sterling");
    });

    it("returns found=false with helpful message when account does not exist", async () => {
      const res = await searchAccountByEmail("non_existent_user_99999@randomdomain.xyz");
      expect(res.success).toBe(true);
      expect(res.found).toBe(false);
      expect(res.account).toBeUndefined();
      expect(res.error).toMatch(/no account found/i);
    });
  });

  describe("Step 2: Confirm Account & Dispatch Reset OTP", () => {
    it("generates a 6-digit OTP and records expiry timestamp", async () => {
      const res = await sendPasswordResetOtp(testEmail);
      expect(res.success).toBe(true);
      expect(res.code).toBeDefined();
      expect(res.code?.length).toBe(6);
      expect(/^\d{6}$/.test(res.code!)).toBe(true);
      resetCode = res.code!;

      // Verify stored in DB
      const user = await UserModel.findOne({ email: testEmail });
      expect(user?.resetPasswordOtp).toBe(resetCode);
      expect(user?.resetPasswordOtpExpires).toBeDefined();
      expect(user?.resetPasswordOtpExpires!.getTime()).toBeGreaterThan(Date.now());
    });

    it("rejects sending OTP to non-existent account", async () => {
      const res = await sendPasswordResetOtp("ghost_user@unknown.com");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/account not found/i);
    });
  });

  describe("Step 3: Reset Password with OTP Verification", () => {
    it("rejects reset when an invalid OTP is submitted", async () => {
      const res = await resetPasswordWithOtp(testEmail, "000000", updatedPassword);
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/invalid/i);
    });

    it("rejects passwords under 6 characters", async () => {
      const res = await resetPasswordWithOtp(testEmail, resetCode, "123");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/at least 6 characters/i);
    });

    it("successfully resets password with the valid OTP", async () => {
      const res = await resetPasswordWithOtp(testEmail, resetCode, updatedPassword);
      expect(res.success).toBe(true);
      expect(res.user).toBeDefined();
      expect(res.user?.email).toBe(testEmail);

      // Verify OTP is cleared in database
      const user = await UserModel.findOne({ email: testEmail });
      expect(user?.resetPasswordOtp).toBeUndefined();
      expect(user?.resetPasswordOtpExpires).toBeUndefined();
    });

    it("fails login with old password and succeeds with new password", async () => {
      const oldLogin = await loginUser(testEmail, initialPassword);
      expect(oldLogin.success).toBe(false);

      const newLogin = await loginUser(testEmail, updatedPassword);
      expect(newLogin.success).toBe(true);
      expect(newLogin.user?.name).toBe("Maya Sterling");
    });
  });

  describe("Auth API Route Handlers (/api/auth)", () => {
    it("handles action: search_account via POST request", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search_account", email: testEmail }),
      });
      const res = await POST(req);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.found).toBe(true);
      expect(json.account?.email).toBe(testEmail);
    });

    it("handles action: send_reset_otp via POST request", async () => {
      const req = new NextRequest("http://localhost:3000/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_reset_otp", email: testEmail }),
      });
      const res = await POST(req);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.code).toBeDefined();
    });

    it("handles action: reset_password via POST request", async () => {
      // First get fresh OTP
      const otpRes = await sendPasswordResetOtp(testEmail);
      const freshOtp = otpRes.code!;
      const thirdPassword = "ThirdNewPassword789!";

      const req = new NextRequest("http://localhost:3000/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password",
          email: testEmail,
          code: freshOtp,
          newPassword: thirdPassword,
        }),
      });
      const res = await POST(req);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.user?.email).toBe(testEmail);

      // Verify sign in with third password
      const loginRes = await loginUser(testEmail, thirdPassword);
      expect(loginRes.success).toBe(true);
    });
  });
});
