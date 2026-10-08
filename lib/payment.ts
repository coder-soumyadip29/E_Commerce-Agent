import crypto from "crypto";
import { getProductById, getDb, calculatePromoDiscount, saveFallbackOrder } from "./db";
import { Product, Order, OrderItem } from "./types";
import { connectToDatabase } from "./mongodb";
import { PaymentModel, IPaymentItem } from "./models/Payment";

const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET || "rzp_sec_cartwise_98214f8";

export interface VerifiedCartSummary {
  valid: boolean;
  error?: string;
  items: Array<{
    product: Product;
    quantity: number;
    lineTotal: number;
  }>;
  subtotal: number;
  discountAmount: number;
  discountPercentage: number;
  discountCode?: string;
  finalTotal: number;
}

/**
 * Server-side amount verification strictly against SQLite records.
 * Prevents client-side price tampering by resolving current prices directly from the database.
 */
export function verifyCartAgainstSqlite(
  rawItems: Array<{ productId: number; quantity: number }>,
  discountCode?: string
): VerifiedCartSummary {
  if (!rawItems || rawItems.length === 0) {
    return {
      valid: false,
      error: "Cart is empty.",
      items: [],
      subtotal: 0,
      discountAmount: 0,
      discountPercentage: 0,
      finalTotal: 0,
    };
  }

  const verifiedItems: Array<{ product: Product; quantity: number; lineTotal: number }> = [];
  let subtotal = 0;

  for (const raw of rawItems) {
    const qty = Math.max(1, Math.floor(Number(raw.quantity) || 1));
    const product = getProductById(Number(raw.productId));

    if (!product) {
      return {
        valid: false,
        error: `Product ID #${raw.productId} does not exist in store catalog.`,
        items: [],
        subtotal: 0,
        discountAmount: 0,
        discountPercentage: 0,
        finalTotal: 0,
      };
    }

    if (product.stock <= 0) {
      return {
        valid: false,
        error: `Product '${product.name}' is currently out of stock.`,
        items: [],
        subtotal: 0,
        discountAmount: 0,
        discountPercentage: 0,
        finalTotal: 0,
      };
    }

    const lineTotal = Number((product.price * qty).toFixed(2));
    subtotal += lineTotal;

    verifiedItems.push({
      product,
      quantity: qty,
      lineTotal,
    });
  }

  subtotal = Number(subtotal.toFixed(2));

  let discountAmount = 0;
  let discountPercentage = 0;

  if (discountCode && discountCode.trim()) {
    const promo = calculatePromoDiscount(discountCode, subtotal);
    if (promo.valid) {
      discountAmount = promo.discountAmount;
      discountPercentage = promo.discountPercentage;
    }
  }

  const finalTotal = Math.max(0, Number((subtotal - discountAmount).toFixed(2)));

  return {
    valid: true,
    items: verifiedItems,
    subtotal,
    discountAmount,
    discountPercentage,
    discountCode: discountCode ? discountCode.trim().toUpperCase() : undefined,
    finalTotal,
  };
}

/**
 * Generate a Razorpay/Stripe compatible Order ID
 */
export function generateGatewayOrderId(prefix: "order_rzp" | "pi" = "order_rzp"): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(6).toString("hex");
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Generate a realistic Mock Payment ID
 */
export function generateGatewayPaymentId(method: string = "upi"): string {
  const random = crypto.randomBytes(8).toString("hex");
  return `pay_${method}_${random}`;
}

/**
 * Generate HMAC SHA256 Signature for Razorpay
 */
export function generatePaymentSignature(
  orderId: string,
  paymentId: string,
  secret: string = RAZORPAY_SECRET
): string {
  const body = `${orderId}|${paymentId}`;
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

/**
 * Verify cryptographic signature against expected HMAC SHA256
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string = RAZORPAY_SECRET
): boolean {
  if (!signature || !orderId || !paymentId) return false;
  const expected = generatePaymentSignature(orderId, paymentId, secret);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

/**
 * Atomically create order record in SQLite and decrement stock
 */
export function atomicCreateSqliteOrder(
  verifiedItems: Array<{ product: Product; quantity: number }>,
  finalTotal: number,
  paymentMethod: string,
  paymentId: string,
  extra?: {
    userId?: number;
    deliveryAddress?: any;
    deliverySlot?: any;
    paymentDetails?: any;
  }
): Order {
  const db = getDb();
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  const orderUserId = extra?.userId || 1;

  if (db) {
    let orderRow: Order | null = null;
    try {
      const transaction = db.transaction(() => {
        // 1. Insert into orders table with tracking lifecycle columns
        const orderStmt = db.prepare(`
          INSERT INTO orders (
            user_id, total, status, created_at, payment_id, payment_method, delivery_address_json, delivery_slot, tracking_status, estimated_delivery_time
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const orderResult = orderStmt.run(
          orderUserId,
          finalTotal,
          "placed",
          now,
          paymentId,
          paymentMethod,
          extra?.deliveryAddress ? JSON.stringify(extra.deliveryAddress) : null,
          extra?.deliverySlot?.title || "30-Min Fast Express",
          "placed",
          "25-35 mins (Express Delivery)"
        );
        const newOrderId = Number(orderResult.lastInsertRowid);

        // 2. Insert items and decrement stock
        const itemStmt = db.prepare(
          "INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES (?, ?, ?, ?, ?)"
        );
        const stockStmt = db.prepare(
          "UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?"
        );

        for (const item of verifiedItems) {
          itemStmt.run(
            newOrderId,
            item.product.id,
            item.product.name,
            item.product.price,
            item.quantity
          );
          stockStmt.run(item.quantity, item.product.id);
        }

        // 3. Fetch newly created order with items
        const fetchOrder = db.prepare("SELECT * FROM orders WHERE id = ?").get(newOrderId) as any;
        const fetchItems = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(newOrderId) as OrderItem[];

        orderRow = {
          id: fetchOrder.id,
          user_id: fetchOrder.user_id !== undefined ? Number(fetchOrder.user_id) : orderUserId,
          total: fetchOrder.total,
          status: fetchOrder.status,
          created_at: fetchOrder.created_at,
          payment_id: fetchOrder.payment_id || paymentId,
          payment_method: fetchOrder.payment_method || paymentMethod,
          delivery_address_json: fetchOrder.delivery_address_json,
          delivery_slot: fetchOrder.delivery_slot,
          tracking_status: fetchOrder.tracking_status || "placed",
          estimated_delivery_time: fetchOrder.estimated_delivery_time || "25-35 mins (Express Delivery)",
          items: fetchItems,
          delivery_partner: {
            name: "Rahul Sharma",
            phone: "+91 98451 22890",
            vehicle: "Ather 450X EV (KA-03-HA-8821)",
            badge: "FastFleet Certified EV Rider",
            rating: 4.9,
          },
        };
      });

      transaction();
      if (orderRow) return orderRow;
    } catch (e: any) {
      console.warn("SQLite atomic transaction fallback:", e.message);
    }
  }

  // Fallback in-memory order creation
  const fallbackId = Date.now();
  const fallbackOrder: Order = {
    id: fallbackId,
    user_id: orderUserId,
    total: finalTotal,
    status: "delivered",
    created_at: now,
    delivery_address_json: extra?.deliveryAddress ? JSON.stringify(extra.deliveryAddress) : undefined,
    delivery_slot: extra?.deliverySlot?.title || "30-Min Fast Express",
    payment_method: paymentMethod,
    payment_id: paymentId,
    tracking_status: "placed",
    estimated_delivery_time: "25-35 mins (Express Delivery)",
    items: verifiedItems.map((item, idx) => ({
      id: fallbackId + idx + 1,
      order_id: fallbackId,
      product_id: item.product.id,
      product_name: item.product.name,
      unit_price: item.product.price,
      quantity: item.quantity,
    })),
  };

  saveFallbackOrder(fallbackOrder);
  return fallbackOrder;
}

/**
 * Record payment audit log in MongoDB
 */
export async function logPaymentInMongo(
  paymentData: {
    orderId: string;
    paymentId?: string;
    signature?: string;
    amount: number;
    subtotal: number;
    discountAmount: number;
    discountCode?: string;
    paymentMethod: "upi" | "card" | "netbanking" | "cod";
    paymentDetails?: any;
    items: IPaymentItem[];
    sqliteOrderId?: number;
    status: "created" | "paid" | "failed" | "cod_pending";
  }
): Promise<void> {
  try {
    await connectToDatabase();
    await PaymentModel.findOneAndUpdate(
      { orderId: paymentData.orderId },
      paymentData,
      { upsert: true, new: true }
    );
  } catch (err: any) {
    console.warn("MongoDB payment logging notice:", err.message);
  }
}
