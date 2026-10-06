import { describe, it, expect, beforeAll } from "vitest";
import { connectToDatabase } from "../lib/mongodb";
import { UserModel } from "../lib/models/User";
import {
  registerUser,
  verifyUserEmail,
  loginUser,
  addUserAddress,
  updateUserPreferences,
  resendVerificationCode,
} from "../lib/userDb";

describe("MongoDB User Authentication, Verification & Preferences", () => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  let verificationCode = "";

  beforeAll(async () => {
    await connectToDatabase();
    // Clean up test user if exists
    await UserModel.deleteOne({ email: testEmail });
  });

  it("registers a new user and issues a 6-digit verification code", async () => {
    const res = await registerUser(
      "Test User",
      testEmail,
      "SuperSecret123!",
      ["Certified Organic", "Gluten-Free"]
    );

    expect(res.success).toBe(true);
    expect(res.user).toBeDefined();
    expect(res.user?.email).toBe(testEmail);
    expect(res.user?.isVerified).toBe(false);
    expect(res.verificationCode).toBeDefined();
    expect(res.verificationCode?.length).toBe(6);

    verificationCode = res.verificationCode!;
  });

  it("prevents registering with duplicate email", async () => {
    const res = await registerUser("Duplicate", testEmail, "pass123");
    expect(res.success).toBe(false);
    expect(res.error).toMatch(/already exists/i);
  });

  it("blocks login before email is verified and prompts for verification", async () => {
    const res = await loginUser(testEmail, "SuperSecret123!");
    expect(res.success).toBe(false);
    expect(res.needsVerification).toBe(true);
  });

  it("verifies user with valid OTP code", async () => {
    const res = await verifyUserEmail(testEmail, verificationCode);
    expect(res.success).toBe(true);
    expect(res.user?.isVerified).toBe(true);
  });

  it("logs in successfully after verification", async () => {
    const res = await loginUser(testEmail, "SuperSecret123!");
    expect(res.success).toBe(true);
    expect(res.user?.name).toBe("Test User");
  });

  it("adds and persists a new delivery address in MongoDB", async () => {
    const loginRes = await loginUser(testEmail, "SuperSecret123!");
    const userId = loginRes.user!.id;

    const addrRes = await addUserAddress(userId, {
      label: "Workplace",
      recipient_name: "Test User",
      phone: "+1 555 999 8888",
      street: "500 Howard St",
      city: "San Francisco",
      state: "CA",
      zip_code: "94105",
      country: "United States",
      is_default: true,
    });

    expect(addrRes.success).toBe(true);
    expect(addrRes.address?.label).toBe("Workplace");
    expect(addrRes.address?.is_default).toBe(true);
  });

  it("updates dietary preferences and persists in MongoDB", async () => {
    const loginRes = await loginUser(testEmail, "SuperSecret123!");
    const userId = loginRes.user!.id;

    const prefRes = await updateUserPreferences(userId, {
      dietary_tags: ["100% Vegan", "Raw & Cold-Pressed"],
      max_spend_budget: 500,
    });

    expect(prefRes.success).toBe(true);
    expect(prefRes.user?.preferences.dietary_tags).toContain("100% Vegan");
    expect(prefRes.user?.preferences.max_spend_budget).toBe(500);
  });

  it("resends verification code if requested", async () => {
    const res = await resendVerificationCode(testEmail);
    expect(res.success).toBe(true);
    expect(res.code?.length).toBe(6);
  });
});
