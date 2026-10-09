import { describe, it, expect } from "vitest";
import { handleMockChat } from "../lib/agent/mock";
import { ChatMessage, OrderTrackingInfo } from "../lib/types";

describe("Live Mapbox Rider Telemetry & GPS Tracker", () => {
  it("should return rich telemetry coordinates and EV vehicle specs for live tracking query", async () => {
    const messages: ChatMessage[] = [
      {
        id: "1",
        role: "user",
        content: "Where is order 1040? Track rider delivery",
        timestamp: Date.now(),
      },
    ];

    const res = await handleMockChat(messages);
    expect(res.type).toBe("products");

    if (res.type === "products") {
      const tracking = res.orderTracking as OrderTrackingInfo;
      expect(tracking).toBeDefined();
      expect(tracking.orderId).toBe("#1040");
      expect(tracking.status).toBe("OUT FOR DELIVERY");
      expect(tracking.step).toBe("out_for_delivery");

      // Verify Rider Vehicle & EV Telemetry
      expect(tracking.riderName).toBe("Ramesh Kumar");
      expect(tracking.riderVehicle).toContain("Ather 450X EV");
      expect(tracking.riderRating).toBe(4.9);
      expect(tracking.speedKmh).toBeGreaterThan(20);
      expect(tracking.batteryPercent).toBeGreaterThan(50);

      // Verify Geographic Coordinates
      expect(tracking.originCoords).toBeDefined();
      expect(tracking.originCoords?.lat).toBeCloseTo(12.9279, 2);
      expect(tracking.originCoords?.lng).toBeCloseTo(77.6271, 2);

      expect(tracking.destinationCoords).toBeDefined();
      expect(tracking.destinationCoords?.lat).toBeCloseTo(12.9378, 2);
      expect(tracking.destinationCoords?.lng).toBeCloseTo(77.6248, 2);

      expect(tracking.currentCoords).toBeDefined();
      expect(typeof tracking.currentCoords?.lat).toBe("number");
      expect(typeof tracking.currentCoords?.lng).toBe("number");
      expect(tracking.routeProgress).toBeGreaterThan(0);
    }
  });

  it("should compute valid bearings between coordinates along the route", () => {
    // Bearing from Bangalore Hub to North-West destination
    const p1 = { lat: 12.9279, lng: 77.6271 };
    const p2 = { lat: 12.9378, lng: 77.6248 };

    const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
    const lat1 = (p1.lat * Math.PI) / 180;
    const lat2 = (p2.lat * Math.PI) / 180;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    const brng = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

    expect(brng).toBeGreaterThan(0);
    expect(brng).toBeLessThan(360);
    // Heading should be in North-West quadrant (approx 340°-355°)
    expect(brng).toBeGreaterThan(300);
  });
});
