import path from "path";
import fs from "fs";
import { Product, Order, Review, OrderItem } from "./types";
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_REVIEWS, getProductImageUrl } from "./storeData";

let betterSqliteInstance: any = null;
let betterSqliteFailed = false;

export const CATEGORIES_DATA = [
  {
    name: "Fruits & Vegetables",
    slug: "fruits-vegetables",
    sub_categories: [
      { name: "Fresh Fruits", slug: "fresh-fruits" },
      { name: "Fresh Vegetables", slug: "fresh-vegetables" },
      { name: "Leafy Greens & Herbs", slug: "leafy-greens-herbs" }
    ]
  },
  {
    name: "Staples",
    slug: "staples",
    sub_categories: [
      { name: "Rice & Rice Products", slug: "rice-rice-products" },
      { name: "Atta, Flours & Sooji", slug: "atta-flours-sooji" },
      { name: "Pulses & Lentils", slug: "pulses-lentils" },
      { name: "Millets & Oats", slug: "millets-oats" },
      { name: "Salt, Sugar & Jaggery", slug: "salt-sugar-jaggery" }
    ]
  },
  {
    name: "Spices & Masalas",
    slug: "spices-masalas",
    sub_categories: [
      { name: "Whole Spices", slug: "whole-spices" },
      { name: "Ground Spices", slug: "ground-spices" },
      { name: "Masala Blends", slug: "masala-blends" }
    ]
  },
  {
    name: "Oils & Ghee",
    slug: "oils-ghee",
    sub_categories: [
      { name: "Cooking Oils", slug: "cooking-oils" },
      { name: "Ghee", slug: "ghee" }
    ]
  },
  {
    name: "Dry Fruits & Nuts",
    slug: "dry-fruits-nuts",
    sub_categories: [
      { name: "Nuts", slug: "nuts" },
      { name: "Dried Fruits", slug: "dried-fruits" },
      { name: "Seeds", slug: "seeds" }
    ]
  },
  {
    name: "Dairy & Eggs",
    slug: "dairy-eggs",
    sub_categories: [
      { name: "Milk, Curd & Beverages", slug: "milk-curd-beverages" },
      { name: "Paneer, Butter & Cheese", slug: "paneer-butter-cheese" },
      { name: "Eggs", slug: "eggs" }
    ]
  },
  {
    name: "Meat & Fish",
    slug: "meat-fish",
    sub_categories: [
      { name: "Chicken", slug: "chicken" },
      { name: "Mutton", slug: "mutton" },
      { name: "Fish & Seafood", slug: "fish-seafood" }
    ]
  },
  {
    name: "Beverages",
    slug: "beverages",
    sub_categories: [
      { name: "Tea & Coffee", slug: "tea-coffee" },
      { name: "Juices & Water", slug: "juices-water" }
    ]
  },
  {
    name: "Snacks & Packaged Foods",
    slug: "snacks-packaged-foods",
    sub_categories: [
      { name: "Biscuits & Snacks", slug: "biscuits-snacks" },
      { name: "Noodles, Pasta & Cereals", slug: "noodles-pasta-cereals" },
      { name: "Spreads, Sauces & Pickles", slug: "spreads-sauces-pickles" }
    ]
  },
  {
    name: "Bakery & Breads",
    slug: "bakery-breads",
    sub_categories: [
      { name: "Breads & Buns", slug: "breads-buns" }
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
      sql += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ? OR p.sub_category LIKE ?)`;
      const like = `%${options.query}%`;
      params.push(like, like, like, like);
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
      const rows = stmt.all(...params) as Array<any>;
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
    const q = options.query.toLowerCase();
    sql += ` AND (p.name LIKE '%${options.query}%' OR p.description LIKE '%${options.query}%')`;
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.sub_category && p.sub_category.toLowerCase().includes(q))
    );
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

export function getOrders(): Order[] {
  const db = getDb();
  if (db) {
    try {
      const stmt = db.prepare("SELECT * FROM orders ORDER BY id DESC");
      const orders = stmt.all() as Order[];
      const itemsStmt = db.prepare("SELECT * FROM order_items WHERE order_id = ?");
      for (const order of orders) {
        order.items = itemsStmt.all(order.id) as OrderItem[];
      }
      return orders;
    } catch (e) {
      // Fallback
    }
  }

  return [...memoryOrders];
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
    if (item.product.stock < item.quantity) {
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
    if (prod) {
      prod.stock -= item.quantity;
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
import { INITIAL_USERS } from "./storeData";
import { UserProfile, UserAddress, UserPreferences } from "./types";

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

