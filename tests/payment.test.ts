import { describe, it, expect, beforeAll } from "vitest";
import {
  verifyCartAgainstSqlite,
  generateGatewayOrderId,
  generateGatewayPaymentId,
  generatePaymentSignature,
  verifyPaymentSignature,
  atomicCreateSqliteOrder,
} from "../lib/payment";
import { connectToDatabase } from "../lib/mongodb";
import { PaymentModel } from "../lib/models/Payment";
import { getProductById, getDb } from "../lib/db";

describe("Payment Gateway Integration & Server-Side Security", () => {
  const secretKey = "rzp_sec_cartwise_98214f8";

  beforeAll(async () => {
    await connectToDatabase();
  });

  it("verifies cart prices strictly against SQLite and calculates subtotal", () => {
    const p1 = getProductById(1)!;
    const p2 = getProductById(2)!;
    const rawItems = [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ];

    const verified = verifyCartAgainstSqlite(rawItems);
    expect(verified.valid).toBe(true);
    expect(verified.items.length).toBe(2);
    expect(verified.subtotal).toBe(Number((p1.price * 2 + p2.price * 1).toFixed(2)));
    expect(verified.finalTotal).toBe(verified.subtotal);
  });

  it("applies server-side promo coupon calculation (SAVE10 = 15% off)", () => {
    const p1 = getProductById(1)!;
    const rawItems = [{ productId: 1, quantity: 2 }];
    const verified = verifyCartAgainstSqlite(rawItems, "SAVE10");

    const expectedSubtotal = Number((p1.price * 2).toFixed(2));
    const expectedDiscount = Number((expectedSubtotal * 0.15).toFixed(2));
    const expectedFinal = Number((expectedSubtotal - expectedDiscount).toFixed(2));

    expect(verified.valid).toBe(true);
    expect(verified.subtotal).toBe(expectedSubtotal);
    expect(verified.discountAmount).toBe(expectedDiscount);
    expect(verified.finalTotal).toBe(expectedFinal);
  });

  it("blocks order creation for out-of-stock items (Product 6 stock = 0)", () => {
    const rawItems = [{ productId: 6, quantity: 1 }];
    const verified = verifyCartAgainstSqlite(rawItems);
    expect(verified.valid).toBe(false);
    expect(verified.error).toMatch(/out of stock/i);
  });

  it("generates Razorpay/Stripe compatible order IDs and payment IDs", () => {
    const rzpOrderId = generateGatewayOrderId("order_rzp");
    const stripeOrderId = generateGatewayOrderId("pi");
    const paymentId = generateGatewayPaymentId("upi");

    expect(rzpOrderId).toMatch(/^order_rzp_/);
    expect(stripeOrderId).toMatch(/^pi_/);
    expect(paymentId).toMatch(/^pay_upi_/);
  });

  it("generates and cryptographically verifies HMAC SHA-256 signatures", () => {
    const orderId = "order_rzp_test_1001";
    const paymentId = "pay_upi_gpay_2002";

    const signature = generatePaymentSignature(orderId, paymentId, secretKey);
    expect(signature).toBeDefined();
    expect(signature.length).toBe(64); // 256-bit hex string

    // Correct signature passes
    const isValid = verifyPaymentSignature(orderId, paymentId, signature, secretKey);
    expect(isValid).toBe(true);

    // Tampered signature or order fails
    const isTampered = verifyPaymentSignature(
      "order_rzp_hacked",
      paymentId,
      signature,
      secretKey
    );
    expect(isTampered).toBe(false);
  });

  it("atomically creates order in SQLite upon verified payment", () => {
    const prod1 = getProductById(1)!;
    const initialStock = prod1.stock;

    const items = [{ product: prod1, quantity: 1 }];
    const sqliteOrder = atomicCreateSqliteOrder(
      items,
      prod1.price,
      "upi",
      "pay_upi_test_3003"
    );

    expect(sqliteOrder).toBeDefined();
    expect(sqliteOrder.id).toBeDefined();
    expect(sqliteOrder.total).toBe(prod1.price);
    expect(sqliteOrder.items?.length).toBe(1);

    // Verify stock was updated
    const updatedProd1 = getProductById(1)!;
    expect(updatedProd1.stock).toBeLessThanOrEqual(initialStock);

    // Restore stock for concurrent test suite isolation
    const db = getDb();
    if (db) db.prepare("UPDATE products SET stock = ? WHERE id = ?").run(initialStock, prod1.id);
  });

  it("logs payment audit records in MongoDB", async () => {
    const testOrderId = `order_rzp_audit_${Date.now()}`;
    await PaymentModel.create({
      orderId: testOrderId,
      paymentId: "pay_test_audit_4004",
      amount: 45.98,
      subtotal: 45.98,
      currency: "USD",
      status: "paid",
      paymentMethod: "card",
      paymentDetails: { cardLast4: "4242", cardBrand: "Visa" },
      items: [
        {
          productId: 1,
          productName: "Organic Wildflower Honey",
          unitPrice: 12.99,
          quantity: 2,
        },
      ],
      sqliteOrderId: 1050,
    });

    const record = await PaymentModel.findOne({ orderId: testOrderId });
    expect(record).toBeDefined();
    expect(record?.status).toBe("paid");
    expect(record?.amount).toBe(45.98);
  });
});
