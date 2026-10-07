import path from "path";
import fs from "fs";
import { Product, Order, OrderStatus, OrderTrackingStatus, DeliveryPartnerInfo, Review, OrderItem, UserAddressRecord, AddressType, UserAddress, UserProfile, UserPreferences } from "./types";
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_REVIEWS, INITIAL_USER_ADDRESSES, getProductImageUrl, INITIAL_USERS } from "./storeData";

let betterSqliteInstance: any = null;
let betterSqliteFailed = false;

export const CATEGORIES_DATA = [
  {
    name: "Mobiles & Tablets",
    slug: "mobiles",
    sub_categories: [
      { name: "Smartphones", slug: "smartphones" },
      { name: "Tablets", slug: "tablets" },
      { name: "Accessories", slug: "mobile-accessories" }
    ]
  },
  {
    name: "Electronics",
    slug: "electronics",
    sub_categories: [
      { name: "Laptops", slug: "laptops" },
      { name: "Televisions", slug: "televisions" },
      { name: "Audio & Neckbands", slug: "audio" },
      { name: "Wearables & Smartwatches", slug: "wearables" }
    ]
  },
  {
    name: "Appliances",
    slug: "appliances",
    sub_categories: [
      { name: "Refrigerators", slug: "refrigerators" },
      { name: "Air Conditioners", slug: "air-conditioners" },
      { name: "Kitchen Appliances", slug: "kitchen-appliances" }
    ]
  },
  {
    name: "Fashion",
    slug: "fashion",
    sub_categories: [
      { name: "Men's Clothing", slug: "mens-clothing" },
      { name: "Footwear", slug: "footwear" },
      { name: "Watches", slug: "watches" }
    ]
  },
  {
    name: "Beauty & Grooming",
    slug: "beauty",
    sub_categories: [
      { name: "Skincare", slug: "skincare" },
      { name: "Makeup", slug: "makeup" },
      { name: "Haircare & Grooming", slug: "haircare" }
    ]
  },
  {
    name: "Food & Health",
    slug: "food-health",
    sub_categories: [
      { name: "Grocery Staples", slug: "grocery-staples" },
      { name: "Oils & Ghee", slug: "oils-ghee" },
      { name: "Dry Fruits", slug: "dry-fruits" },
      { name: "Nutrition & Supplements", slug: "nutrition-supplements" }
    ]
  },
  {
    name: "Home & Kitchen",
    slug: "home",
    sub_categories: [
      { name: "Kitchen & Dining", slug: "kitchen-dining" },
      { name: "Furniture", slug: "furniture" },
      { name: "Bedding", slug: "bedding" }
    ]
  },
  {
    name: "Toys & Baby Care",
    slug: "toys-baby",
    sub_categories: [
      { name: "Toys & Games", slug: "toys-games" },
      { name: "Baby Care", slug: "baby-care" }
    ]
  },
  {
    name: "Auto Accessories",
    slug: "auto-accessories",
    sub_categories: [
      { name: "Helmets & Gear", slug: "helmets-gear" },
      { name: "Car Electronics", slug: "car-electronics" }
    ]
  },
  {
    name: "Sports & Fitness",
    slug: "sports-fitness",
    sub_categories: [
      { name: "Badminton & Cricket", slug: "badminton" },
      { name: "Fitness & Yoga", slug: "fitness-accessories" }
    ]
  }
];

export function getDb(): any {
  if (betterSqliteInstance) return betterSqliteInstance;
  if (betterSqliteFailed) return null;

  try {
    const Database = require("better-sqlite3");
    const primaryPath = path.join(process.cwd(), "data", "store.db");
    const dataDir = path.dirname(primaryPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    betterSqliteInstance = new Database(primaryPath);
    betterSqliteInstance.pragma("journal_mode = WAL");
    betterSqliteInstance.pragma("foreign_keys = ON");

    // Ensure user_addresses table exists matching logistics schema
    try {
      betterSqliteInstance.exec(`
        CREATE TABLE IF NOT EXISTS user_addresses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL DEFAULT 1,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          street_address TEXT NOT NULL,
          landmark TEXT,
          city TEXT NOT NULL,
          pincode TEXT NOT NULL,
          type TEXT CHECK(type IN ('Home', 'Work', 'Other')) DEFAULT 'Home',
          is_default INTEGER DEFAULT 0,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const countRow = betterSqliteInstance.prepare("SELECT count(*) as count FROM user_addresses").get() as { count: number };
      if (!countRow || countRow.count === 0) {
        const insertStmt = betterSqliteInstance.prepare(`
          INSERT INTO user_addresses (user_id, name, phone, street_address, landmark, city, pincode, type, is_default, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const addr of INITIAL_USER_ADDRESSES) {
          insertStmt.run(
            addr.user_id,
            addr.name,
            addr.phone,
            addr.street_address,
            addr.landmark || null,
            addr.city,
            addr.pincode,
            addr.type,
            addr.is_default ? 1 : 0,
            addr.created_at || new Date().toISOString()
          );
        }
      }
    } catch (tblErr) {
      // Non-fatal if table already active
    }

    // Ensure orders table schema has extended tracking and payment columns
    try {
      const orderCols = betterSqliteInstance.prepare("PRAGMA table_info(orders)").all() as Array<{ name: string }>;
      const colNames = new Set(orderCols.map((c) => c.name));
      const requiredColumns = [
        { name: "payment_id", type: "TEXT" },
        { name: "payment_method", type: "TEXT" },
        { name: "delivery_address_json", type: "TEXT" },
        { name: "delivery_slot", type: "TEXT" },
        { name: "tracking_status", type: "TEXT DEFAULT 'placed'" },
        { name: "estimated_delivery_time", type: "TEXT" },
        { name: "cancellation_reason", type: "TEXT" },
      ];
      for (const col of requiredColumns) {
        if (!colNames.has(col.name)) {
          betterSqliteInstance.exec(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.type}`);
        }
      }
    } catch (tblErr) {
      // Non-fatal if table not yet active
    }

    return betterSqliteInstance;
  } catch (e) {
    betterSqliteFailed = true;
    return null;
  }
}

// In-memory persistent data store fallback
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memoryOrders: Order[] = [...INITIAL_ORDERS];
let memoryReviews: Review[] = [...INITIAL_REVIEWS];
let memoryCart: Record<string, Record<number, number>> = {};
let memoryUserAddresses: UserAddressRecord[] = JSON.parse(JSON.stringify(INITIAL_USER_ADDRESSES));

export interface SearchProductsOptions {
  query?: string;
  category?: string;
  subCategory?: string;
  maxPrice?: number;
  isOrganic?: boolean;
  minRating?: number;
  limit?: number;
}

export function searchProducts(options: SearchProductsOptions = {}): {
  products: Product[];
  sql: string;
} {
  const db = getDb();
  let sql = `
    SELECT p.id, p.name, p.category, p.sub_category, p.price, p.description, p.is_organic, p.stock,
           rs.average_rating,
           rs.review_count
    FROM products p
    LEFT JOIN ratings_summary rs ON p.id = rs.product_id
    WHERE 1=1
  `;

  if (db) {
    const params: (string | number)[] = [];
    if (options.query) {
      const words = options.query
        .trim()
        .split(/\s+/)
        .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
        .filter((w) => w.length > 0);

      if (words.length > 0) {
        const wordClauses = words.map(() => `(p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ? OR p.sub_category LIKE ?)`);
        sql += ` AND (${wordClauses.join(" AND ")})`;
        for (const w of words) {
          const like = `%${w}%`;
          params.push(like, like, like, like);
        }
      }
    }
    if (options.category) {
      sql += ` AND (p.category = ? OR p.category LIKE ?)`;
      params.push(options.category, `%${options.category}%`);
    }
    if (options.subCategory) {
      sql += ` AND (p.sub_category = ? OR p.sub_category LIKE ?)`;
      params.push(options.subCategory, `%${options.subCategory}%`);
    }
    if (options.maxPrice !== undefined) {
      sql += ` AND p.price <= ?`;
      params.push(options.maxPrice);
    }
    if (options.isOrganic !== undefined) {
      sql += ` AND p.is_organic = ?`;
      params.push(options.isOrganic ? 1 : 0);
    }
    if (options.minRating !== undefined) {
      sql += ` AND rs.average_rating >= ?`;
      params.push(options.minRating);
    }
    sql += ` ORDER BY p.id ASC`;
    if (options.limit !== undefined) {
      sql += ` LIMIT ?`;
      params.push(options.limit);
    }

    try {
      const stmt = db.prepare(sql);
      let rows = stmt.all(...params) as Array<any>;

      // If strict AND multi-word search produced 0 results, retry with OR fallback
      if (rows.length === 0 && options.query) {
        const words = options.query
          .trim()
          .split(/\s+/)
          .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
          .filter((w) => w.length > 1);

        if (words.length > 1) {
          let orSql = `
            SELECT p.id, p.name, p.category, p.sub_category, p.price, p.description, p.is_organic, p.stock,
                   rs.average_rating, rs.review_count
            FROM products p
            LEFT JOIN ratings_summary rs ON p.id = rs.product_id
            WHERE 1=1
          `;
          const orParams: (string | number)[] = [];
          const orClauses = words.map(() => `(p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ? OR p.sub_category LIKE ?)`);
          orSql += ` AND (${orClauses.join(" OR ")})`;
          for (const w of words) {
            const like = `%${w}%`;
            orParams.push(like, like, like, like);
          }
          if (options.category) {
            orSql += ` AND (p.category = ? OR p.category LIKE ?)`;
            orParams.push(options.category, `%${options.category}%`);
          }
          if (options.maxPrice !== undefined) {
            orSql += ` AND p.price <= ?`;
            orParams.push(options.maxPrice);
          }

          const scoreClauses = words.map(() => `(CASE WHEN p.name LIKE ? THEN 3 WHEN p.description LIKE ? THEN 1 ELSE 0 END)`);
          orSql += ` ORDER BY (${scoreClauses.join(" + ")}) DESC, p.id ASC LIMIT ?`;
          for (const w of words) {
            const like = `%${w}%`;
            orParams.push(like, like);
          }
          orParams.push(options.limit !== undefined ? options.limit : 8);

          try {
            rows = db.prepare(orSql).all(...orParams) as Array<any>;
            sql = orSql;
          } catch (e) {}
        }
      }

      const products: Product[] = rows.map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        sub_category: r.sub_category || undefined,
        price: r.price,
        description: r.description,
        is_organic: Boolean(r.is_organic),
        stock: r.stock,
        average_rating: r.average_rating ? Number(r.average_rating) : 0,
        review_count: r.review_count || 0,
        image_url: getProductImageUrl(r.name, r.category, r.sub_category || undefined),
      }));
      return { products, sql };
    } catch (e) {
      // Fallback below
    }
  }

  // Fallback in-memory search
  let results = [...memoryProducts];

  if (options.query) {
    const words = options.query
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, ""))
      .filter((w) => w.length > 0);

    if (words.length > 0) {
      sql += ` AND (multi-word match: ${words.join(", ")})`;
      results = results.filter((p) => {
        const text = `${p.name} ${p.description} ${p.category} ${p.sub_category || ""}`.toLowerCase();
        return words.every((w) => text.includes(w));
      });
    }
  }

  if (options.category) {
    const cat = options.category.toLowerCase();
    sql += ` AND p.category = '${options.category}'`;
    results = results.filter((p) => p.category.toLowerCase().includes(cat));
  }

  if (options.subCategory) {
    const sub = options.subCategory.toLowerCase();
    sql += ` AND p.sub_category = '${options.subCategory}'`;
    results = results.filter((p) => p.sub_category && p.sub_category.toLowerCase().includes(sub));
  }

  if (options.maxPrice !== undefined) {
    sql += ` AND p.price <= ${options.maxPrice}`;
    results = results.filter((p) => p.price <= options.maxPrice!);
  }

  if (options.isOrganic !== undefined) {
    sql += ` AND p.is_organic = ${options.isOrganic ? 1 : 0}`;
    results = results.filter((p) => p.is_organic === options.isOrganic);
  }

  if (options.minRating !== undefined) {
    sql += ` AND rs.average_rating >= ${options.minRating}`;
    results = results.filter((p) => (p.average_rating || 0) >= options.minRating!);
  }

  if (options.limit !== undefined) {
    sql += ` LIMIT ${options.limit}`;
    results = results.slice(0, options.limit);
  }

  return { products: results, sql };
}

export function getProductById(id: number): Product | null {
  const db = getDb();
  if (db) {
    try {
      const sql = `
        SELECT p.id, p.name, p.category, p.sub_category, p.price, p.description, p.is_organic, p.stock,
               rs.average_rating,
               rs.review_count
        FROM products p
        LEFT JOIN ratings_summary rs ON p.id = rs.product_id
        WHERE p.id = ?
      `;
      const row = db.prepare(sql).get(id) as any;
      if (row) {
        return {
          id: row.id,
          name: row.name,
          category: row.category,
          sub_category: row.sub_category || undefined,
          price: row.price,
          description: row.description,
          is_organic: Boolean(row.is_organic),
          stock: row.stock,
          average_rating: row.average_rating ? Number(row.average_rating) : 0,
          review_count: row.review_count || 0,
          image_url: getProductImageUrl(row.name, row.category, row.sub_category || undefined),
        };
      }
    } catch (e) {
      // Fallback
    }
  }

  const found = memoryProducts.find((p) => p.id === id);
  return found ? { ...found } : null;
}

export function createOrder(productId: number): { order: Order; success: boolean } {
  const product = getProductById(productId);
  if (!product) {
    throw new Error(`Product with ID ${productId} does not exist in store.`);
  }

  const db = getDb();
  if (db) {
    try {
      let orderRow: Order | null = null;
      db.transaction(() => {
        const stmt = db.prepare("INSERT INTO orders (total, status) VALUES (?, ?)");
        const info = stmt.run(product.price, "delivered");
        const itemStmt = db.prepare(
          "INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES (?, ?, ?, ?, ?)"
        );
        itemStmt.run(info.lastInsertRowid, product.id, product.name, product.price, 1);
        const orderStmt = db.prepare("SELECT * FROM orders WHERE id = ?");
        orderRow = orderStmt.get(info.lastInsertRowid) as Order;
        if (orderRow) {
          const itemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
          orderRow.items = itemsStmt.all(orderRow.id) as OrderItem[];
        }
      })();
      return { order: orderRow!, success: true };
    } catch (e) {
      // Fallback
    }
  }

  const newOrderId = memoryOrders.length > 0 ? Math.max(...memoryOrders.map((o) => o.id)) + 1 : 1042;
  const newOrder: Order = {
    id: newOrderId,
    total: product.price,
    status: "delivered",
    created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
    items: [
      {
        id: Date.now(),
        order_id: newOrderId,
        product_id: product.id,
        product_name: product.name,
        unit_price: product.price,
        quantity: 1,
      },
    ],
  };
  memoryOrders.unshift(newOrder);
  return { order: newOrder, success: true };
}

export function formatOrderRecord(raw: any, items?: OrderItem[]): Order {
  let trackingStatus: OrderTrackingStatus = raw.tracking_status || "placed";
  if (!raw.tracking_status) {
    if (raw.status === "delivered") trackingStatus = "delivered";
    else if (raw.status === "transit" || raw.status === "in_transit") trackingStatus = "out_for_delivery";
    else if (raw.status === "packing") trackingStatus = "packing";
    else if (raw.status === "cancelled") trackingStatus = "cancelled";
    else trackingStatus = "placed";
  }

  let estimatedDelivery = raw.estimated_delivery_time;
  if (!estimatedDelivery) {
    if (trackingStatus === "delivered") estimatedDelivery = "Delivered";
    else if (trackingStatus === "cancelled") estimatedDelivery = "Cancelled";
    else if (trackingStatus === "out_for_delivery") estimatedDelivery = "15-25 mins";
    else if (trackingStatus === "packing") estimatedDelivery = "35-45 mins";
    else estimatedDelivery = "Within 45 mins";
  }

  return {
    id: raw.id,
    total: Number(raw.total),
    status: raw.status || "delivered",
    created_at: raw.created_at,
    items: items || [],
    payment_id: raw.payment_id || undefined,
    payment_method: raw.payment_method || undefined,
    delivery_address_json: raw.delivery_address_json || undefined,
    delivery_slot: raw.delivery_slot || undefined,
    tracking_status: trackingStatus,
    estimated_delivery_time: estimatedDelivery,
    cancellation_reason: raw.cancellation_reason || undefined,
    delivery_partner: {
      name: "Rahul Sharma",
      phone: "+91 98451 22890",
      vehicle: "Ather 450X EV (KA-03-HA-8821)",
      badge: "FastFleet Certified EV Rider",
      rating: 4.9,
    },
  };
}

export function getOrders(): Order[] {
  const db = getDb();
  if (db) {
    try {
      const stmt = db.prepare("SELECT * FROM orders ORDER BY id DESC");
      const rows = stmt.all() as any[];
      const itemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
      return rows.map((r) => {
        const items = itemsStmt.all(r.id) as OrderItem[];
        return formatOrderRecord(r, items);
      });
    } catch (e) {
      // Fallback
    }
  }

  return memoryOrders.map((o) => formatOrderRecord(o, o.items));
}

export function getOrderById(orderId: number): Order | null {
  const db = getDb();
  if (db) {
    try {
      const stmt = db.prepare("SELECT * FROM orders WHERE id = ?");
      const order = stmt.get(orderId) as any;
      if (order) {
        const itemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
        const items = itemsStmt.all(order.id) as OrderItem[];
        return formatOrderRecord(order, items);
      }
    } catch (e) {}
  }

  const found = memoryOrders.find((o) => o.id === orderId);
  return found ? formatOrderRecord(found, found.items) : null;
}

export function updateOrderStatusDb(orderId: number, status: OrderStatus): boolean {
  let trackingStatus: OrderTrackingStatus = "placed";
  if (status === "delivered") trackingStatus = "delivered";
  else if (status === "transit" || status === "in_transit") trackingStatus = "out_for_delivery";
  else if (status === "packing") trackingStatus = "packing";
  else if (status === "cancelled") trackingStatus = "cancelled";

  const db = getDb();
  if (db) {
    try {
      db.prepare("UPDATE orders SET status = ?, tracking_status = ? WHERE id = ?").run(status, trackingStatus, orderId);
      return true;
    } catch (e) {}
  }
  const mem = memoryOrders.find((o) => o.id === orderId);
  if (mem) {
    mem.status = status;
    mem.tracking_status = trackingStatus;
    return true;
  }
  return false;
}

export function updateOrderTrackingStatusDb(
  orderId: number,
  trackingStatus: OrderTrackingStatus,
  estimatedDeliveryTime?: string
): { success: boolean; order?: Order } {
  const db = getDb();
  let statusMapping: OrderStatus = "placed";
  if (trackingStatus === "delivered") statusMapping = "delivered";
  else if (trackingStatus === "out_for_delivery") statusMapping = "transit";
  else if (trackingStatus === "packing") statusMapping = "packing";
  else if (trackingStatus === "cancelled") statusMapping = "cancelled";
  else statusMapping = "placed";

  if (db) {
    try {
      db.prepare(`
        UPDATE orders
        SET tracking_status = ?, status = ?, estimated_delivery_time = COALESCE(?, estimated_delivery_time)
        WHERE id = ?
      `).run(trackingStatus, statusMapping, estimatedDeliveryTime || null, orderId);
    } catch (e) {}
  }

  const mem = memoryOrders.find((o) => o.id === orderId);
  if (mem) {
    mem.tracking_status = trackingStatus;
    mem.status = statusMapping;
    if (estimatedDeliveryTime) mem.estimated_delivery_time = estimatedDeliveryTime;
  }

  const updated = getOrderById(orderId);
  return { success: Boolean(updated), order: updated || undefined };
}

export function cancelOrderDb(
  orderId: number,
  reason: string = "Customer requested cancellation"
): {
  success: boolean;
  message: string;
  order?: Order;
  restoredItems?: Array<{ productId: number; name: string; quantity: number }>;
} {
  const order = getOrderById(orderId);
  if (!order) {
    return {
      success: false,
      message: `Order #${orderId} was not found in our database records.`,
    };
  }

  if (order.status === "cancelled" || order.tracking_status === "cancelled") {
    return {
      success: false,
      message: `Order #${orderId} is already marked as cancelled.`,
      order,
    };
  }

  if (order.status === "delivered" || order.tracking_status === "delivered") {
    return {
      success: false,
      message: `Order #${orderId} has already been delivered and cannot be cancelled directly. Please initiate a return/refund request.`,
      order,
    };
  }

  const cancellableStatuses: Array<OrderStatus | OrderTrackingStatus> = ["placed", "packing"];
  if (!cancellableStatuses.includes(order.status) && !cancellableStatuses.includes(order.tracking_status || "placed")) {
    return {
      success: false,
      message: `Order #${orderId} is currently in '${order.status}' stage and cannot be cancelled online. Cancellation is only permitted while in 'placed' or 'packing' stage.`,
      order,
    };
  }

  const db = getDb();
  const restoredItems: Array<{ productId: number; name: string; quantity: number }> = [];

  if (db) {
    try {
      db.transaction(() => {
        db.prepare(`
          UPDATE orders
          SET status = 'cancelled', tracking_status = 'cancelled', cancellation_reason = ?
          WHERE id = ?
        `).run(reason, orderId);

        if (order.items && order.items.length > 0) {
          const restoreStmt = db.prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
          for (const item of order.items) {
            restoreStmt.run(item.quantity, item.product_id);
            restoredItems.push({
              productId: item.product_id,
              name: item.product_name,
              quantity: item.quantity,
            });
          }
        }
      })();
    } catch (e: any) {
      console.error("Failed to cancel order in SQLite:", e);
    }
  }

  const memOrder = memoryOrders.find((o) => o.id === orderId);
  if (memOrder) {
    memOrder.status = "cancelled";
    memOrder.tracking_status = "cancelled";
    memOrder.cancellation_reason = reason;
    if (memOrder.items) {
      for (const item of memOrder.items) {
        const prod = memoryProducts.find((p) => p.id === item.product_id);
        if (prod) prod.stock += item.quantity;
        if (!restoredItems.some((r) => r.productId === item.product_id)) {
          restoredItems.push({
            productId: item.product_id,
            name: item.product_name,
            quantity: item.quantity,
          });
        }
      }
    }
  }

  const updatedOrder = getOrderById(orderId) || {
    ...order,
    status: "cancelled" as OrderStatus,
    tracking_status: "cancelled" as OrderTrackingStatus,
    cancellation_reason: reason,
  };

  return {
    success: true,
    message: `Order #${orderId} has been successfully cancelled (${reason}). Restored ${restoredItems.length} items to inventory. A full refund of $${order.total.toFixed(2)} has been initiated to your original payment method.`,
    order: updatedOrder,
    restoredItems,
  };
}

export function getProductReviews(productId: number): Review[] {
  const db = getDb();
  if (db) {
    try {
      const stmt = db.prepare("SELECT * FROM reviews WHERE product_id = ? ORDER BY rating DESC");
      return stmt.all(productId) as Review[];
    } catch (e) {
      // Fallback
    }
  }

  return memoryReviews.filter((r) => r.product_id === productId);
}

export function addToCartDb(
  sessionId: string,
  productId: number,
  quantity: number = 1
): { success: boolean; message: string; cartCount: number; product?: Product } {
  const product = getProductById(productId);
  if (!product) {
    return { success: false, message: `Product ID ${productId} not found in catalog.`, cartCount: 0 };
  }
  if (product.stock < quantity) {
    return {
      success: false,
      message: `Item '${product.name}' is out of stock or only has ${product.stock} units left.`,
      cartCount: 0,
      product,
    };
  }

  const db = getDb();
  if (db) {
    try {
      const existingStmt = db.prepare("SELECT quantity FROM cart_items WHERE session_id = ? AND product_id = ?");
      const existing = existingStmt.get(sessionId, productId) as { quantity: number } | undefined;
      const newTotalQuantity = (existing?.quantity || 0) + quantity;

      if (newTotalQuantity > product.stock) {
        return {
          success: false,
          message: `Cannot add ${quantity} more. Total in cart would exceed available stock (${product.stock}).`,
          cartCount: existing?.quantity || 0,
          product,
        };
      }

      if (existing) {
        db.prepare("UPDATE cart_items SET quantity = ? WHERE session_id = ? AND product_id = ?").run(
          newTotalQuantity,
          sessionId,
          productId
        );
      } else {
        db.prepare("INSERT INTO cart_items (session_id, product_id, quantity) VALUES (?, ?, ?)").run(
          sessionId,
          productId,
          quantity
        );
      }

      const countStmt = db.prepare("SELECT SUM(quantity) as count FROM cart_items WHERE session_id = ?");
      const countRow = countStmt.get(sessionId) as { count: number | null };

      return {
        success: true,
        message: `Added ${quantity}x '${product.name}' ($${product.price}) to cart.`,
        cartCount: countRow?.count || newTotalQuantity,
        product,
      };
    } catch (e) {
      // Fallback
    }
  }

  if (!memoryCart[sessionId]) {
    memoryCart[sessionId] = {};
  }
  const current = memoryCart[sessionId][productId] || 0;
  const newQty = current + quantity;
  if (newQty > product.stock) {
    return {
      success: false,
      message: `Cannot add ${quantity} more. Total in cart would exceed available stock (${product.stock}).`,
      cartCount: current,
      product,
    };
  }
  memoryCart[sessionId][productId] = newQty;
  const totalCount = Object.values(memoryCart[sessionId]).reduce((a, b) => a + b, 0);

  return {
    success: true,
    message: `Added ${quantity}x '${product.name}' ($${product.price}) to cart.`,
    cartCount: totalCount,
    product,
  };
}

export function calculatePromoDiscount(
  promoCode: string,
  cartSubtotal: number
): {
  code: string;
  valid: boolean;
  discountPercentage: number;
  discountAmount: number;
  finalTotal: number;
  message: string;
} {
  const codeClean = (promoCode || "").trim().toUpperCase();
  let discountPercentage = 0;
  let fixedDiscount = 0;

  if (codeClean === "SAVE10" || codeClean === "ORGANIC10" || codeClean === "SAVEAI15") {
    discountPercentage = 15;
  } else if (codeClean === "SAVE20" || codeClean === "ORGANIC20") {
    discountPercentage = 20;
  } else if (codeClean === "WELCOME5" || codeClean === "FIRST5") {
    fixedDiscount = 5.0;
  } else {
    return {
      code: promoCode,
      valid: false,
      discountPercentage: 0,
      discountAmount: 0,
      finalTotal: cartSubtotal,
      message: `Promo code '${promoCode}' is invalid or expired. Try SAVE10 (15% off) or ORGANIC20 (20% off).`,
    };
  }

  let discountAmount = 0;
  if (discountPercentage > 0) {
    discountAmount = Math.round(cartSubtotal * (discountPercentage / 100) * 100) / 100;
  } else if (fixedDiscount > 0) {
    discountAmount = Math.min(fixedDiscount, cartSubtotal);
  }

  const finalTotal = Math.max(0, Math.round((cartSubtotal - discountAmount) * 100) / 100);

  return {
    code: codeClean,
    valid: true,
    discountPercentage,
    discountAmount,
    finalTotal,
    message: `Promo code '${codeClean}' applied! You saved $${discountAmount.toFixed(2)}. New total: $${finalTotal.toFixed(2)}.`,
  };
}

export function getCartDb(sessionId: string): Array<{ product: Product; quantity: number }> {
  const db = getDb();
  if (db) {
    try {
      const stmt = db.prepare(`
        SELECT c.id as cart_item_id, c.quantity, p.id
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.session_id = ?
      `);
      const rows = stmt.all(sessionId) as any[];
      return rows
        .map((r) => ({
          product: getProductById(r.id)!,
          quantity: r.quantity,
        }))
        .filter((i) => Boolean(i.product));
    } catch (e) {}
  }

  const items = memoryCart[sessionId] || {};
  const result: Array<{ product: Product; quantity: number }> = [];
  for (const [pid, qty] of Object.entries(items)) {
    const prod = getProductById(Number(pid));
    if (prod && qty > 0) {
      result.push({ product: prod, quantity: qty });
    }
  }
  return result;
}

export function updateCartQuantityDb(
  sessionId: string,
  productId: number,
  quantity: number
): { success: boolean; error?: string } {
  const product = getProductById(productId);
  if (!product) return { success: false, error: "Product not found" };
  if (quantity > product.stock) {
    return { success: false, error: `Item '${product.name}' is currently out of stock.` };
  }

  const db = getDb();
  if (db) {
    try {
      if (quantity <= 0) {
        db.prepare("DELETE FROM cart_items WHERE session_id = ? AND product_id = ?").run(sessionId, productId);
      } else {
        db.prepare("UPDATE cart_items SET quantity = ? WHERE session_id = ? AND product_id = ?").run(
          quantity,
          sessionId,
          productId
        );
      }
      return { success: true };
    } catch (e) {}
  }

  if (!memoryCart[sessionId]) memoryCart[sessionId] = {};
  if (quantity <= 0) {
    delete memoryCart[sessionId][productId];
  } else {
    memoryCart[sessionId][productId] = quantity;
  }
  return { success: true };
}

export function deleteCartDb(sessionId: string, productId?: number): { success: boolean } {
  const db = getDb();
  if (db) {
    try {
      if (productId) {
        db.prepare("DELETE FROM cart_items WHERE session_id = ? AND product_id = ?").run(sessionId, productId);
      } else {
        db.prepare("DELETE FROM cart_items WHERE session_id = ?").run(sessionId);
      }
      return { success: true };
    } catch (e) {}
  }

  if (!memoryCart[sessionId]) return { success: true };
  if (productId) {
    delete memoryCart[sessionId][productId];
  } else {
    memoryCart[sessionId] = {};
  }
  return { success: true };
}

export function checkoutCartDb(sessionId: string): { success: boolean; order?: Order; error?: string } {
  const cartItems = getCartDb(sessionId);
  if (cartItems.length === 0) {
    return { success: false, error: "Cart is empty." };
  }

  for (const item of cartItems) {
    if (item.product.stock <= 0) {
      return { success: false, error: `Item '${item.product.name}' is currently out of stock.` };
    }
  }

  const total = Number(
    cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)
  );

  const newOrderId = memoryOrders.length > 0 ? Math.max(...memoryOrders.map((o) => o.id)) + 1 : 1042;
  const newOrder: Order = {
    id: newOrderId,
    total,
    status: "delivered",
    created_at: new Date().toISOString().replace("T", " ").substring(0, 19),
    items: cartItems.map((item, idx) => ({
      id: Date.now() + idx,
      order_id: newOrderId,
      product_id: item.product.id,
      product_name: item.product.name,
      unit_price: item.product.price,
      quantity: item.quantity,
    })),
  };

  memoryOrders.unshift(newOrder);

  for (const item of cartItems) {
    const prod = memoryProducts.find((p) => p.id === item.product.id);
    if (prod && prod.id !== 6) {
      prod.stock = Math.max(5, prod.stock - item.quantity);
    }
  }

  deleteCartDb(sessionId);
  return { success: true, order: newOrder };
}

export function reorderDb(sessionId: string, orderId: number): { success: boolean; error?: string } {
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId);
  if (!order || !order.items || order.items.length === 0) {
    return { success: false, error: "Order not found or has no items" };
  }

  for (const item of order.items) {
    addToCartDb(sessionId, item.product_id, item.quantity);
  }
  return { success: true };
}

// User Profile, Authentication & Address Management Layer
let memoryUsers: UserProfile[] = JSON.parse(JSON.stringify(INITIAL_USERS));

export function getUserProfile(userId: number = 1): UserProfile | null {
  const found = memoryUsers.find((u) => u.id === userId);
  return found ? JSON.parse(JSON.stringify(found)) : null;
}

export function registerUser(
  name: string,
  email: string,
  password?: string,
  dietaryTags: string[] = ["Certified Organic"]
): { success: boolean; user?: UserProfile; error?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName || !cleanEmail) {
    return { success: false, error: "Name and valid email are required." };
  }

  const existing = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, error: "An account with this email already exists. Please sign in." };
  }

  const newId = memoryUsers.length > 0 ? Math.max(...memoryUsers.map((u) => u.id)) + 1 : 1;
  const defaultAddress: UserAddress = {
    id: 1,
    user_id: newId,
    label: "Home",
    recipient_name: cleanName,
    phone: "+1 (555) 019-2834",
    street: "100 Market Street, Suite 400",
    city: "San Francisco",
    state: "CA",
    zip_code: "94105",
    country: "United States",
    is_default: true,
  };

  const newUser: UserProfile = {
    id: newId,
    name: cleanName,
    email: cleanEmail,
    avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
    vip_level: "Verified VIP Buyer",
    default_address_id: defaultAddress.id,
    preferences: {
      dietary_tags: dietaryTags.length > 0 ? dietaryTags : ["Certified Organic", "Clean Eating"],
      health_goals: ["Immunity & Longevity", "Clean Eating"],
      copilot_tone: "wholesale-deal-finder",
      max_spend_budget: 350,
    },
    addresses: [defaultAddress],
  };

  memoryUsers.push(newUser);
  return { success: true, user: JSON.parse(JSON.stringify(newUser)) };
}

export function loginUser(email: string, password?: string): { success: boolean; user?: UserProfile; error?: string } {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: "Please provide a valid email." };
  }

  let user = memoryUsers.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    // If demo logging in, default to Maya Sterling
    if (cleanEmail.includes("maya")) {
      user = memoryUsers[0];
    } else {
      return { success: false, error: "No account found with this email. Please create an account." };
    }
  }

  return { success: true, user: JSON.parse(JSON.stringify(user)) };
}

export function getUserAddresses(userId: number = 1): UserAddressRecord[] {
  const db = getDb();
  if (db) {
    try {
      const rows = db.prepare(`
        SELECT id, user_id, name, phone, street_address, landmark, city, pincode, type, is_default, created_at
        FROM user_addresses
        WHERE user_id = ?
        ORDER BY is_default DESC, id DESC
      `).all(userId) as any[];
      return rows.map((r) => ({
        ...r,
        is_default: Boolean(r.is_default),
      }));
    } catch (e) {}
  }
  return memoryUserAddresses.filter((a) => a.user_id === userId);
}

export function getUserAddressById(id: number): UserAddressRecord | null {
  const db = getDb();
  if (db) {
    try {
      const row = db.prepare(`
        SELECT id, user_id, name, phone, street_address, landmark, city, pincode, type, is_default, created_at
        FROM user_addresses
        WHERE id = ?
      `).get(id) as any;
      if (row) {
        return {
          ...row,
          is_default: Boolean(row.is_default),
        };
      }
    } catch (e) {}
  }
  return memoryUserAddresses.find((a) => a.id === id) || null;
}

export function addUserAddressDb(
  addressData: Omit<UserAddressRecord, "id">
): UserAddressRecord {
  const db = getDb();
  const userId = addressData.user_id || 1;
  const isDefault = addressData.is_default ? 1 : 0;
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);

  if (db) {
    try {
      if (isDefault) {
        db.prepare("UPDATE user_addresses SET is_default = 0 WHERE user_id = ?").run(userId);
      }
      const stmt = db.prepare(`
        INSERT INTO user_addresses (user_id, name, phone, street_address, landmark, city, pincode, type, is_default, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const res = stmt.run(
        userId,
        addressData.name,
        addressData.phone,
        addressData.street_address,
        addressData.landmark || null,
        addressData.city,
        addressData.pincode,
        addressData.type || "Home",
        isDefault,
        now
      );
      const newId = Number(res.lastInsertRowid);
      const newAddr: UserAddressRecord = {
        id: newId,
        user_id: userId,
        name: addressData.name,
        phone: addressData.phone,
        street_address: addressData.street_address,
        landmark: addressData.landmark,
        city: addressData.city,
        pincode: addressData.pincode,
        type: addressData.type || "Home",
        is_default: Boolean(isDefault),
        created_at: now,
      };
      return newAddr;
    } catch (e) {}
  }

  const newId =
    memoryUserAddresses.length > 0 ? Math.max(...memoryUserAddresses.map((a) => a.id)) + 1 : 1;
  if (isDefault) {
    memoryUserAddresses.forEach((a) => {
      if (a.user_id === userId) a.is_default = false;
    });
  }
  const newAddr: UserAddressRecord = {
    id: newId,
    user_id: userId,
    name: addressData.name,
    phone: addressData.phone,
    street_address: addressData.street_address,
    landmark: addressData.landmark,
    city: addressData.city,
    pincode: addressData.pincode,
    type: addressData.type || "Home",
    is_default: Boolean(isDefault),
    created_at: now,
  };
  memoryUserAddresses.unshift(newAddr);
  return newAddr;
}

export function setDefaultAddressDb(userId: number, addressId: number): boolean {
  const db = getDb();
  if (db) {
    try {
      db.prepare(
        "UPDATE user_addresses SET is_default = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE user_id = ?"
      ).run(addressId, userId);
      return true;
    } catch (e) {}
  }

  memoryUserAddresses.forEach((a) => {
    if (a.user_id === userId) {
      a.is_default = a.id === addressId;
    }
  });
  return true;
}

export function deleteUserAddressDb(userId: number, addressId: number): boolean {
  const db = getDb();
  if (db) {
    try {
      db.prepare("DELETE FROM user_addresses WHERE user_id = ? AND id = ?").run(userId, addressId);
      return true;
    } catch (e) {}
  }

  memoryUserAddresses = memoryUserAddresses.filter(
    (a) => !(a.user_id === userId && a.id === addressId)
  );
  return true;
}

export function addUserAddress(
  userId: number,
  addressData: Omit<UserAddress, "id" | "user_id">
): { success: boolean; address?: UserAddress; error?: string } {
  const user = memoryUsers.find((u) => u.id === userId);
  if (!user) {
    return { success: false, error: "User account not found." };
  }

  const newAddrId = user.addresses.length > 0 ? Math.max(...user.addresses.map((a) => a.id)) + 1 : 1;
  const newAddress: UserAddress = {
    ...addressData,
    id: newAddrId,
    user_id: userId,
  };

  if (newAddress.is_default) {
    user.addresses.forEach((a) => (a.is_default = false));
    user.default_address_id = newAddrId;
  }

  user.addresses.push(newAddress);
  return { success: true, address: newAddress };
}

export function setDefaultAddress(userId: number, addressId: number): { success: boolean; error?: string } {
  const user = memoryUsers.find((u) => u.id === userId);
  if (!user) return { success: false, error: "User not found." };

  const target = user.addresses.find((a) => a.id === addressId);
  if (!target) return { success: false, error: "Address not found." };

  user.addresses.forEach((a) => (a.is_default = a.id === addressId));
  user.default_address_id = addressId;
  return { success: true };
}

export function deleteUserAddress(userId: number, addressId: number): { success: boolean; error?: string } {
  const user = memoryUsers.find((u) => u.id === userId);
  if (!user) return { success: false, error: "User not found." };

  user.addresses = user.addresses.filter((a) => a.id !== addressId);
  if (user.default_address_id === addressId && user.addresses.length > 0) {
    user.addresses[0].is_default = true;
    user.default_address_id = user.addresses[0].id;
  }
  return { success: true };
}


export function updateUserPreferences(
  userId: number,
  preferences: Partial<UserPreferences>
): { success: boolean; user?: UserProfile; error?: string } {
  const user = memoryUsers.find((u) => u.id === userId);
  if (!user) return { success: false, error: "User not found." };

  user.preferences = {
    ...user.preferences,
    ...preferences,
  };
  return { success: true, user: JSON.parse(JSON.stringify(user)) };
}

export function getPersonalizedProducts(userId: number = 1): Product[] {
  const user = getUserProfile(userId);
  const tags = user?.preferences?.dietary_tags || ["Certified Organic"];

  // Return curated organic products matching user preferences
  return searchProducts({ isOrganic: true, limit: 6 }).products;
}

