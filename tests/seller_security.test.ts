import { describe, it, expect } from "vitest";
import {
  getSellerProducts,
  getSellerOrders,
  getSellerEarningsSummary,
  requestSellerPayout,
  toggleSellerCoupon,
  getSellerCoupons,
  createSellerProduct,
  updateSellerStock,
} from "../lib/sellerDb";
import { authenticateSellerCredentials } from "../lib/sellerAuth";

describe("Seller Security, Zero-IDOR & Ownership Isolation Tests", () => {
  it("authenticates valid active seller credentials", () => {
    const auth1 = authenticateSellerCredentials("vikram@natureharvest.in", "Seller@12345");
    expect(auth1.success).toBe(true);
    expect(auth1.seller?.id).toBe(1);
    expect(auth1.seller?.status).toBe("ACTIVE");

    const auth2 = authenticateSellerCredentials("ananya@techvault.com", "Seller@12345");
    expect(auth2.success).toBe(true);
    expect(auth2.seller?.id).toBe(2);

    const badAuth = authenticateSellerCredentials("vikram@natureharvest.in", "WrongPassword");
    expect(badAuth.success).toBe(false);
  });

  it("strictly isolates product catalog by seller ID (Seller 1 vs Seller 2)", () => {
    const seller1Products = getSellerProducts(1);
    const seller2Products = getSellerProducts(2);

    expect(seller1Products.length).toBeGreaterThan(0);
    expect(seller2Products.length).toBeGreaterThan(0);

    // Assert every product returned for Seller 1 belongs to Seller 1
    seller1Products.forEach((p) => {
      expect(p.seller_id).toBe(1);
    });

    // Assert every product returned for Seller 2 belongs to Seller 2
    seller2Products.forEach((p) => {
      expect(p.seller_id).toBe(2);
    });

    // Cross-contamination check: Seller 1 catalog must not include Seller 2 items
    const s1Ids = new Set(seller1Products.map((p) => p.id));
    const s2Ids = new Set(seller2Products.map((p) => p.id));
    const intersection = [...s1Ids].filter((id) => s2Ids.has(id));
    expect(intersection.length).toBe(0);
  });

  it("strictly isolates sub-orders by seller ID", () => {
    const seller1Orders = getSellerOrders(1);
    const seller2Orders = getSellerOrders(2);

    seller1Orders.forEach((so) => {
      expect(so.seller_id).toBe(1);
    });

    seller2Orders.forEach((so) => {
      expect(so.seller_id).toBe(2);
    });
  });

  it("rejects unauthorized stock update across seller boundaries (IDOR prevention)", () => {
    const seller2Prods = getSellerProducts(2);
    expect(seller2Prods.length).toBeGreaterThan(0);
    const targetProdId = seller2Prods[0].id;

    // Seller 1 attempts to update Seller 2's product stock
    const attempt = updateSellerStock(1, targetProdId, 999);
    expect(attempt.success).toBe(false);
    expect(attempt.error).toContain("Unauthorized");
  });

  it("prevents negative inventory stock allocation", () => {
    const seller1Prods = getSellerProducts(1);
    const targetProdId = seller1Prods[0].id;

    const attempt = updateSellerStock(1, targetProdId, -10);
    expect(attempt.success).toBe(false);
    expect(attempt.error).toContain("cannot be negative");
  });

  it("validates payout bounds and prevents double/over-withdrawal", () => {
    const summary = getSellerEarningsSummary(1);
    expect(summary.availableBalance).toBeGreaterThanOrEqual(0);

    // Requesting more than available balance must fail
    const excessiveAmount = summary.availableBalance + 500000;
    const overAttempt = requestSellerPayout(1, excessiveAmount);
    expect(overAttempt.success).toBe(false);
    expect(overAttempt.error).toContain("exceeds available balance");

    // Requesting below minimum threshold (₹500) must fail
    const underAttempt = requestSellerPayout(1, 100);
    expect(underAttempt.success).toBe(false);
    expect(underAttempt.error).toContain("Minimum withdrawal amount is ₹500");
  });

  it("enforces seller coupon ownership isolation", () => {
    const s1Coupons = getSellerCoupons(1);
    if (s1Coupons.length > 0) {
      const s1CouponId = s1Coupons[0].id;

      // Seller 2 attempts to toggle Seller 1's coupon
      const attack = toggleSellerCoupon(2, s1CouponId);
      expect(attack.success).toBe(false);
      expect(attack.error).toContain("Unauthorized");
    }
  });

  it("enforces valid product creation fields and prevents empty titles", () => {
    const invalidProd = createSellerProduct(1, {
      name: "",
      category: "Groceries",
      price: 100,
    });
    expect(invalidProd.success).toBe(false);
    expect(invalidProd.error).toContain("Product name is required");
  });
});
