import { describe, it, expect } from "vitest";
import { generateInvoiceData, getHsnCode } from "../lib/invoice";
import { sendOrderInvoiceEmail } from "../lib/email";
import { Order, OrderItem, UserAddressRecord, DeliverySlot } from "../lib/types";

describe("Invoice & Receipt Generation Deliverables", () => {
  const mockOrder: Order = {
    id: 9901,
    status: "delivered",
    total: 36.98,
    created_at: "2026-10-06T15:30:00.000Z",
  };

  const mockItems: OrderItem[] = [
    {
      id: 1,
      order_id: 9901,
      product_id: 1,
      product_name: "Raw Organic Forest Honey",
      quantity: 2,
      unit_price: 18.49,
    },
  ];

  const mockAddress: UserAddressRecord = {
    id: 101,
    user_id: 1,
    name: "Suman Kuity",
    phone: "+91 98765 43210",
    street_address: "Flat 402, Green Valley Apartments",
    landmark: "Near Eco Park Gate 2",
    city: "Kolkata",
    pincode: "700156",
    type: "Home",
    is_default: true,
  };

  const mockSlot: DeliverySlot = {
    id: "express_30min",
    title: "⚡ Instant 30-Min Fast Delivery",
    subtitle: "Express Courier dispatch within 10 mins",
    badge: "Grocery Express",
    timeWindow: "Within 30 mins",
    price: 0,
    estimatedTime: "15-30 mins",
  };

  it("should generate standard HSN codes for grocery and organic items", () => {
    expect(getHsnCode("Raw Organic Forest Honey")).toBe("0409 00 00");
    expect(getHsnCode("Steel Cut Rolled Oats")).toBe("1904 10 90");
    expect(getHsnCode("Extra Virgin Cold Pressed Olive Oil")).toBe("1509 90 00");
    expect(getHsnCode("Almond Butter Creamy")).toBe("2008 19 20");
    expect(getHsnCode("Generic Item")).toBe("2106 90 99");
  });

  it("should compute accurate GST breakdown (CGST 2.5% + SGST 2.5% = 5%)", () => {
    const invoice = generateInvoiceData({
      order: mockOrder,
      items: mockItems,
      paymentMethod: "upi",
      transactionId: "upi_tx_9901_verified",
      address: mockAddress,
      slot: mockSlot,
      userEmail: "sumankuity68@gmail.com",
    });

    expect(invoice.invoiceNumber).toMatch(/INV-\d{4}-9901/);
    expect(invoice.orderId).toBe(9901);
    expect(invoice.paymentId).toBe("upi_tx_9901_verified");
    expect(invoice.paymentMethod).toBe("upi");
    expect(invoice.storeGstin).toBe("29AAACC1206D1ZM");
    expect(invoice.finalTotal).toBe(36.98);

    // GST validation: Taxable + CGST + SGST must equal finalTotal (within rounding precision)
    const { gst } = invoice;
    expect(gst.cgstRate).toBe(2.5);
    expect(gst.sgstRate).toBe(2.5);

    const calculatedTotal = Number((gst.taxableSubtotal + gst.cgstAmount + gst.sgstAmount).toFixed(2));
    expect(calculatedTotal).toBe(36.98);
    expect(gst.totalGst).toBe(Number((gst.cgstAmount + gst.sgstAmount).toFixed(2)));

    // Itemized pricing
    expect(invoice.items.length).toBe(1);
    const item = invoice.items[0];
    expect(item.product_name).toBe("Raw Organic Forest Honey");
    expect(item.hsn_code).toBe("0409 00 00");
    expect(item.quantity).toBe(2);
    expect(item.unit_price).toBe(18.49);
    expect(item.line_total).toBe(36.98);
  });

  it("should attach customer address and delivery slot information to the invoice", () => {
    const invoice = generateInvoiceData({
      order: mockOrder,
      items: mockItems,
      paymentMethod: "card",
      transactionId: "ch_mock_stripe_9901",
      address: mockAddress,
      slot: mockSlot,
      userEmail: "sumankuity68@gmail.com",
    });

    expect(invoice.customerName).toBe("Suman Kuity");
    expect(invoice.customerPhone).toBe("+91 98765 43210");
    expect(invoice.customerEmail).toBe("sumankuity68@gmail.com");
    expect(invoice.deliveryAddress?.street_address).toBe("Flat 402, Green Valley Apartments");
    expect(invoice.deliveryAddress?.city).toBe("Kolkata");
    expect(invoice.deliveryAddress?.pincode).toBe("700156");
    expect(invoice.deliveryAddress?.type).toBe("Home");
    expect(invoice.deliverySlot?.title).toBe("⚡ Instant 30-Min Fast Delivery");
  });

  it("should attempt sending order invoice email via Brevo SMTP", async () => {
    const invoice = generateInvoiceData({
      order: mockOrder,
      items: mockItems,
      paymentMethod: "upi",
      transactionId: "upi_tx_9901_verified",
      address: mockAddress,
      slot: mockSlot,
      userEmail: "sumankuity68@gmail.com",
    });

    const result = await sendOrderInvoiceEmail(invoice);
    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("message");
    expect(typeof result.success).toBe("boolean");
    expect(typeof result.message).toBe("string");
    expect(result.success).toBe(true);
  });
});
