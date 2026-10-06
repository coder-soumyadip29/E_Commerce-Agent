import { describe, it, expect, beforeEach } from "vitest";
import {
  getDb,
  createOrder,
  getOrderById,
  getOrders,
  updateOrderTrackingStatusDb,
  cancelOrderDb,
  formatOrderRecord,
} from "../lib/db";
import { OrderTrackingStatus } from "../lib/types";

describe("Real-Time Order Tracking & Lifecycle Engine (Deliverable 3)", () => {
  let testOrderId: number;

  beforeEach(() => {
    // Create fresh test order on product 15
    const orderRes = createOrder(15);
    testOrderId = orderRes.order.id;
  });

  it("should have all extended tracking and payment columns in SQLite orders table", () => {
    const db = getDb();
    if (!db) return;

    const tableInfo = db.prepare("PRAGMA table_info(orders)").all() as Array<{ name: string }>;
    const columnNames = tableInfo.map((c) => c.name);

    expect(columnNames).toContain("payment_id");
    expect(columnNames).toContain("payment_method");
    expect(columnNames).toContain("delivery_address_json");
    expect(columnNames).toContain("delivery_slot");
    expect(columnNames).toContain("tracking_status");
    expect(columnNames).toContain("estimated_delivery_time");
    expect(columnNames).toContain("cancellation_reason");
  });

  it("should transition order through all 4 tracking lifecycle stages", () => {
    const stages: OrderTrackingStatus[] = [
      "placed",
      "packing",
      "out_for_delivery",
      "delivered",
    ];

    for (const stage of stages) {
      const updateRes = updateOrderTrackingStatusDb(testOrderId, stage, `Stage: ${stage}`);
      expect(updateRes.success).toBe(true);

      const fetchedOrder = getOrderById(testOrderId);
      expect(fetchedOrder).not.toBeNull();
      expect(fetchedOrder?.tracking_status).toBe(stage);

      // Verify status mapping
      if (stage === "delivered") {
        expect(fetchedOrder?.status).toBe("delivered");
      } else if (stage === "out_for_delivery") {
        expect(fetchedOrder?.status).toBe("transit");
      } else if (stage === "packing") {
        expect(fetchedOrder?.status).toBe("packing");
      } else {
        expect(fetchedOrder?.status).toBe("placed");
      }
    }
  });

  it("should attach delivery partner contact card details to retrieved orders", () => {
    updateOrderTrackingStatusDb(testOrderId, "out_for_delivery", "15 mins");
    const order = getOrderById(testOrderId);

    expect(order?.delivery_partner).toBeDefined();
    expect(order?.delivery_partner?.name).toBe("Rahul Sharma");
    expect(order?.delivery_partner?.phone).toBe("+91 98451 22890");
    expect(order?.delivery_partner?.vehicle).toContain("EV");
    expect(order?.delivery_partner?.rating).toBeGreaterThanOrEqual(4.8);
  });

  it("should record cancellation reason and update tracking_status when cancelled", () => {
    // Must be in placed or packing stage to be cancelled
    updateOrderTrackingStatusDb(testOrderId, "placed");

    const reason = "Accidental duplicate order by user";
    const cancelRes = cancelOrderDb(testOrderId, reason);

    expect(cancelRes.success).toBe(true);
    expect(cancelRes.order?.status).toBe("cancelled");
    expect(cancelRes.order?.tracking_status).toBe("cancelled");
    expect(cancelRes.order?.cancellation_reason).toBe(reason);

    const reFetched = getOrderById(testOrderId);
    expect(reFetched?.tracking_status).toBe("cancelled");
    expect(reFetched?.cancellation_reason).toBe(reason);
  });

  it("should format legacy orders with appropriate tracking stages and default ETA", () => {
    const rawRecord = {
      id: 9991,
      total: 42.5,
      status: "delivered",
      created_at: "2026-10-06 18:00:00",
    };

    const formatted = formatOrderRecord(rawRecord, []);
    expect(formatted.tracking_status).toBe("delivered");
    expect(formatted.estimated_delivery_time).toBe("Delivered");
    expect(formatted.delivery_partner).toBeDefined();
  });
});
