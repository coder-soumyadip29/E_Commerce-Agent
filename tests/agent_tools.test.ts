import { describe, it, expect, beforeEach } from "vitest";
import {
  trackSpecificOrderTool,
  cancelOrderTool,
  generateInvoiceTool,
} from "../lib/agent/real";
import {
  createOrder,
  getOrderById,
  updateOrderStatusDb,
  getProductById,
} from "../lib/db";

describe("AI Shopping Agent Order & Payment Tools (lib/agent/real.ts)", () => {
  let testOrderId: number;
  const testProductId = 12;

  beforeEach(() => {
    // Create a fresh test order
    const orderRes = createOrder(testProductId);
    testOrderId = orderRes.order.id;
  });

  describe("tool: track_specific_order({ order_id })", () => {
    it("should return live tracking status, delivery agent details, and ETA for an active order", async () => {
      // Set to in-transit stage to test live courier telemetry
      updateOrderStatusDb(testOrderId, "transit");

      const execRes = await trackSpecificOrderTool({ order_id: testOrderId });

      expect(execRes.toolName).toBe("track_specific_order");
      expect(execRes.result.found).toBe(true);
      expect(execRes.result.order_id).toBe(testOrderId);
      expect(execRes.result.status).toBe("transit");

      // Verify delivery agent details
      expect(execRes.result.deliveryAgent).not.toBeNull();
      expect(execRes.result.deliveryAgent).toHaveProperty("name");
      expect(execRes.result.deliveryAgent).toHaveProperty("phone");
      expect(execRes.result.deliveryAgent).toHaveProperty("vehicle");

      // Verify live location and ETA
      expect(execRes.result.eta).toBeDefined();
      expect(typeof execRes.result.eta).toBe("string");
      expect(execRes.result.liveLocation).toBeDefined();
      expect(execRes.result.checkpoints).toBeInstanceOf(Array);
      expect(execRes.result.checkpoints.length).toBeGreaterThan(0);
    });

    it("should return delivered state when order is already completed", async () => {
      updateOrderStatusDb(testOrderId, "delivered");

      const execRes = await trackSpecificOrderTool({ order_id: testOrderId });

      expect(execRes.result.found).toBe(true);
      expect(execRes.result.status).toBe("delivered");
      expect(execRes.result.eta).toBe("Delivered");
      expect(execRes.result.liveLocation).toContain("Delivered");
    });

    it("should gracefully handle non-existent order ID", async () => {
      const nonExistentId = 999999;
      const execRes = await trackSpecificOrderTool({ order_id: nonExistentId });

      expect(execRes.result.found).toBe(false);
      expect(execRes.result.message).toContain("was not found");
      expect(execRes.traceStep.status).toBe("failed");
    });
  });

  describe("tool: cancel_order({ order_id, reason })", () => {
    it("should validate and cancel order in 'placed' or 'packing' stage and restore inventory", async () => {
      // Put order into 'placed' stage
      updateOrderStatusDb(testOrderId, "placed");

      const productBefore = getProductById(testProductId);
      const initialStock = productBefore?.stock || 0;

      const cancelRes = await cancelOrderTool({
        order_id: testOrderId,
        reason: "Ordered wrong package size",
      });

      expect(cancelRes.result.success).toBe(true);
      expect(cancelRes.result.message).toContain("successfully cancelled");
      expect(cancelRes.result.order.status).toBe("cancelled");

      // Verify stock was restored in database
      const productAfter = getProductById(testProductId);
      expect(productAfter?.stock).toBe(initialStock + 1);

      // Verify restoredItems list
      expect(cancelRes.result.restoredItems).toBeInstanceOf(Array);
      expect(cancelRes.result.restoredItems.length).toBeGreaterThan(0);
      expect(cancelRes.result.restoredItems[0].productId).toBe(testProductId);
    });

    it("should cancel order in 'packing' stage as well", async () => {
      updateOrderStatusDb(testOrderId, "packing");

      const cancelRes = await cancelOrderTool({
        order_id: testOrderId,
        reason: "Duplicate order",
      });

      expect(cancelRes.result.success).toBe(true);
      expect(cancelRes.result.order.status).toBe("cancelled");
    });

    it("should reject cancellation if order has already been delivered", async () => {
      updateOrderStatusDb(testOrderId, "delivered");

      const cancelRes = await cancelOrderTool({
        order_id: testOrderId,
        reason: "Changed my mind",
      });

      expect(cancelRes.result.success).toBe(false);
      expect(cancelRes.result.message).toContain("already been delivered");

      // Verify status remained delivered
      const currentOrder = getOrderById(testOrderId);
      expect(currentOrder?.status).toBe("delivered");
    });

    it("should reject cancellation if order is already cancelled", async () => {
      updateOrderStatusDb(testOrderId, "cancelled");

      const cancelRes = await cancelOrderTool({
        order_id: testOrderId,
        reason: "Testing duplicate cancel",
      });

      expect(cancelRes.result.success).toBe(false);
      expect(cancelRes.result.message).toContain("already marked as cancelled");
    });

    it("should reject cancellation if order is already in transit", async () => {
      updateOrderStatusDb(testOrderId, "transit");

      const cancelRes = await cancelOrderTool({
        order_id: testOrderId,
        reason: "Too late",
      });

      expect(cancelRes.result.success).toBe(false);
      expect(cancelRes.result.message).toContain("cannot be cancelled");
    });
  });

  describe("tool: generate_invoice({ order_id })", () => {
    it("should return itemized breakdown, taxes (CGST + SGST), discounts, and PDF link", async () => {
      const invRes = await generateInvoiceTool({ order_id: testOrderId });

      expect(invRes.toolName).toBe("generate_invoice");
      expect(invRes.result.success).toBe(true);
      expect(invRes.result.invoiceNumber).toMatch(/INV-\d{4}-\d+/);
      expect(invRes.result.orderId).toBe(testOrderId);
      expect(invRes.result.storeGstin).toBe("29AAACC1206D1ZM");

      // GST Breakdown verification
      const { gst } = invRes.result;
      expect(gst).toBeDefined();
      expect(gst.cgst).toBeGreaterThan(0);
      expect(gst.sgst).toBeGreaterThan(0);
      expect(gst.totalGst).toBe(Number((gst.cgst + gst.sgst).toFixed(2)));

      // Itemized rows with HSN codes
      expect(invRes.result.items).toBeInstanceOf(Array);
      expect(invRes.result.items.length).toBeGreaterThan(0);
      expect(invRes.result.items[0]).toHaveProperty("hsn");
      expect(invRes.result.items[0]).toHaveProperty("unitPrice");
      expect(invRes.result.items[0]).toHaveProperty("lineTotal");

      // Downloadable link
      expect(invRes.result.downloadPdfUrl).toBe(`/api/orders/${testOrderId}/invoice`);
    });

    it("should return error when generating invoice for non-existent order", async () => {
      const invRes = await generateInvoiceTool({ order_id: 888888 });

      expect(invRes.result.success).toBe(false);
      expect(invRes.result.message).toContain("does not exist");
      expect(invRes.traceStep.status).toBe("failed");
    });
  });
});
